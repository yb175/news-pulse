import React from 'react';
import { Article } from '../../lib/api';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div style={{
      padding: '16px',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
          {article.source}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {article.title}
        </h4>
      </a>
      {article.summary && (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {article.summary}
        </p>
      )}
    </div>
  );
}
