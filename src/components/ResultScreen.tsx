import { GameStats } from '../App';

type ResultProps = {
  stats: GameStats;
  onRetry: () => void;
};

export default function ResultScreen({ stats, onRetry }: ResultProps) {
  return (
    <div className="result-card">
      <h2 style={{ fontSize: '2rem', color: stats.passed ? 'var(--success)' : 'var(--accent-color)' }}>
        {stats.passed ? 'STAGE CLEAR!' : 'GAME OVER'}
      </h2>
      
      <div className="score-text">
        {stats.score} PTS
      </div>

      <div style={{ width: '100%', maxWidth: '300px', margin: '1rem 0', textAlign: 'left' }}>
        <div className="stat-row">
          <span>TOTAL PLAYS:</span>
          <span>{stats.totalPlays}</span>
        </div>
        <div className="stat-row">
          <span>MAX SCORE:</span>
          <span>{stats.maxScore}</span>
        </div>
        <div className="stat-row">
          <span>FIRST CLEAR SCORE:</span>
          <span>{stats.firstPassScore ?? 'N/A'}</span>
        </div>
        <div className="stat-row">
          <span>ATTEMPTS TO CLEAR:</span>
          <span>{stats.attemptsToPass ?? 'N/A'}</span>
        </div>
      </div>

      <button className="pixel-btn secondary" onClick={onRetry}>
        PLAY AGAIN
      </button>
    </div>
  );
}
