import React, { useState } from 'react';
import { triggerIngestion } from '../../lib/api';

interface RefreshButtonProps {
  onRefreshCompleted: () => void;
}

export default function RefreshButton({ onRefreshCompleted }: RefreshButtonProps) {
  const [running, setRunning] = useState(false);

  const handleTrigger = async () => {
    setRunning(true);
    try {
      await triggerIngestion();
      // Delay slightly for backend python runner compilation
      setTimeout(() => {
        onRefreshCompleted();
        setRunning(false);
      }, 3000);
    } catch (e) {
      console.error(e);
      setRunning(false);
    }
  };

  return (
    <button
      onClick={handleTrigger}
      disabled={running}
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        background: 'var(--accent-gradient)',
        color: '#ffffff',
        border: 'none',
        fontWeight: 600,
        fontSize: '14px',
        cursor: running ? 'not-allowed' : 'pointer',
        opacity: running ? 0.7 : 1,
        boxShadow: running ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.4)'
      }}
    >
      {running ? 'Ingesting Feeds...' : 'Sync News Feeds'}
    </button>
  );
}
