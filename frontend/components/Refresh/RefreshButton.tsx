import React from 'react';

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function RefreshButton({ onRefresh, isRefreshing }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onRefresh()}
      disabled={isRefreshing}
      style={{
        height: '36px',
        padding: '0 16px',
        background: 'var(--surface-color)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        cursor: isRefreshing ? 'not-allowed' : 'pointer',
        opacity: isRefreshing ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 150ms ease, border-color 150ms ease'
      }}
      className="refresh-btn"
    >
      {/* SVG Spinner or Icon */}
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{
          animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
          transition: 'transform 0.3s ease'
        }}
      >
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .refresh-btn:hover:not(:disabled) {
          background-color: #FFFDF4 !important;
          border-color: var(--text-primary) !important;
        }
      `}</style>
      {isRefreshing ? 'Syncing...' : 'Sync Feed'}
    </button>
  );
}
