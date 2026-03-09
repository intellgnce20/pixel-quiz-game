import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

export type Question = {
  qId: string;
  question: string;
  options: { key: string; text: string }[];
};

export type GameStats = {
  score: number;
  passed: boolean;
  totalPlays: number;
  maxScore: number;
  firstPassScore: number | null;
  attemptsToPass: number | null;
};

// If env is missing, we use mock mode for demonstration
const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || '';
const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5');

function App() {
  const [gameState, setGameState] = useState<'WELCOME' | 'PLAYING' | 'RESULT'>('WELCOME');
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Preload boss images (1 to 100)
  useEffect(() => {
    for (let i = 1; i <= 100; i++) {
      const img = new Image();
      img.src = `https://api.dicebear.com/8.x/pixel-art/svg?seed=Boss${i}`;
    }
  }, []);

  const startGame = async (id: string) => {
    if (!id.trim()) return;
    setUserId(id);
    setLoading(true);

    if (!GAS_URL) {
      // Mock questions if no GAS URL provided
      setTimeout(() => {
        const mockQuestions = Array.from({ length: QUESTION_COUNT }).map((_, i) => ({
          qId: `Q${i + 1}`,
          question: `This is a test question #${i + 1}. What is 1 + ${i}?`,
          options: [
            { key: 'A', text: `${1 + i}` },
            { key: 'B', text: `${2 + i}` },
            { key: 'C', text: `${3 + i}` },
            { key: 'D', text: `${4 + i}` }
          ]
        }));
        setQuestions(mockQuestions);
        setGameState('PLAYING');
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${GAS_URL}?action=getQuestions&count=${QUESTION_COUNT}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setGameState('PLAYING');
      } else {
        alert('Failed to load questions: ' + data.message);
      }
    } catch (e) {
      alert('Error connecting to Server');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitGame = async (finalAnswers: Record<string, string>) => {
    setLoading(true);

    if (!GAS_URL) {
      // Mock grading based on logic
      console.log("Mock grading with answers:", finalAnswers);
      setTimeout(() => {
        let correctCount = 0;
        const total = Object.keys(finalAnswers).length;
        
        // Mock correct answers: The correct answer to '1 + i' is always generated as option 'A'
        Object.keys(finalAnswers).forEach((qId) => {
           console.log(`Question ${qId} - User answered: ${finalAnswers[qId]}, Correct: A`);
           if (finalAnswers[qId] === 'A') {
              correctCount++;
           }
        });
        
        const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        const passed = score >= 60; // Assuming 60 is pass
        console.log(`Mock grading result: correctCount=${correctCount}, score=${score}, passed=${passed}`);

        setStats({
          score,
          passed,
          totalPlays: 5,
          maxScore: score > 0 ? score : 0, 
          firstPassScore: passed ? score : null,
          attemptsToPass: passed ? 2 : null
        });
        setGameState('RESULT');
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // GAS requires text/plain for cors
        },
        body: JSON.stringify({
          action: 'submit',
          id: userId,
          answers: finalAnswers
        })
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setGameState('RESULT');
      } else {
        alert('Failed to submit: ' + data.message);
      }
    } catch (e) {
      alert('Error submitting to Server');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setGameState('WELCOME');
    setQuestions([]);
    setStats(null);
  };

  return (
    <div className="app-container">
      {loading && (
        <div className="loading-overlay">
          <span className="blinking">LOADING...</span>
        </div>
      )}

      {gameState === 'WELCOME' && <WelcomeScreen onStart={startGame} />}
      {gameState === 'PLAYING' && (
        <GameScreen
          questions={questions}
          onSubmit={submitGame}
        />
      )}
      {gameState === 'RESULT' && stats && (
        <ResultScreen stats={stats} onRetry={reset} />
      )}
    </div>
  );
}

export default App;
