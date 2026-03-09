import { useState } from 'react';

type WelcomeProps = {
  onStart: (id: string) => void;
};

export default function WelcomeScreen({ onStart }: WelcomeProps) {
  const [id, setId] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <h1 className="pixel-title">PIXEL QUIZ<br/>ARCADE</h1>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>INSERT COIN / ENTER ID</p>
        <input 
          className="pixel-input"
          placeholder="PLAYER_1"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onStart(id)}
        />
        <button 
          className="pixel-btn primary"
          onClick={() => onStart(id)}
        >
          START GAME
        </button>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
        © 2026 PIXEL CORP.
      </div>
    </div>
  );
}
