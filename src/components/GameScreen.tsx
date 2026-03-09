import { useState, useMemo } from 'react';
import { Question } from '../App';

type GameScreenProps = {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
};

export default function GameScreen({ questions, onSubmit }: GameScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Random boss seed for this level, tied to the index so it doesn't change on re-render
  // but changes for each question. Use preloaded seed range 1-100.
  const bossSeed = useMemo(() => Math.floor(Math.random() * 100) + 1, [currentIndex]);

  const currentQ = questions[currentIndex];

  const handleSelect = (key: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.qId]: key }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      onSubmit(answers);
    }
  };

  const selectedKey = answers[currentQ.qId];

  return (
    <div className="game-layout">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981' }}>
        <span>STAGE {currentIndex + 1}</span>
        <span>SCORE: ???</span>
      </div>

      <div className="boss-container">
        <img src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=Boss${bossSeed}`} alt="Boss" />
      </div>

      <div className="question-box">
        {currentQ.question}
      </div>

      <div className="options-grid">
        {currentQ.options.map((opt) => (
          <button
            key={opt.key}
            className={`pixel-btn ${selectedKey === opt.key ? 'selected' : ''}`}
            onClick={() => handleSelect(opt.key)}
          >
            {opt.key}. {opt.text}
          </button>
        ))}
      </div>

      <button 
        className="pixel-btn primary" 
        style={{ marginTop: 'auto' }}
        onClick={handleNext}
        disabled={!selectedKey}
      >
        {currentIndex === questions.length - 1 ? 'SUBMIT' : 'NEXT STAGE'}
      </button>
    </div>
  );
}
