import React from 'react';
import { Article } from '../../lib/api';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="paper-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px 16px' /* Reduced vertical padding */
      }}
    >
      {/* Eyebrow metadata */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '9px', 
            fontWeight: 'bold', 
            padding: '2px 6px',
            border: '1px solid var(--border-color)',
            borderRadius: '2px',
            background: 'var(--bg-color)',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {article.source}
        </span>
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '10px', /* Reduced from 11px */
            color: 'var(--text-secondary)' 
          }}
        >
          {formatDate(article.publishedAt)} {formatTime(article.publishedAt)}
        </span>
      </div>

      {/* Article Title */}
      <h4 
        style={{ 
          fontSize: '14px', 
          fontWeight: 700, 
          fontFamily: 'var(--font-serif)', 
          color: 'var(--text-primary)',
          lineHeight: '1.3',
          margin: 0
        }}
      >
        {article.title}
      </h4>

      {/* Summary snippet */}
      {article.summary && (
        <p 
          style={{ 
            fontSize: '12.5px', 
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: 0
          }}
        >
          {article.summary}
        </p>
      )}

      {/* Read Original button (Visually Secondary) */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2px' }}>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mono-font read-link"
          style={{ 
            fontSize: '10px', 
            fontWeight: 'bold',
            color: 'var(--text-secondary)', /* Visually secondary gray */
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'color 150ms ease'
          }}
        >
          <span>Read Original</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
      
      <style>{`
        .read-link:hover {
          color: var(--accent-blue) !important;
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
}
