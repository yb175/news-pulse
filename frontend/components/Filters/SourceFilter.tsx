import React from 'react';

interface SourceFilterProps {
  selectedSources: string[];
  onChange: (sources: string[]) => void;
}

export default function SourceFilter({ selectedSources, onChange }: SourceFilterProps) {
  const sourcesList = ['BBC News', 'The Guardian', 'NPR'];

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      onChange(selectedSources.filter(s => s !== source));
    } else {
      onChange([...selectedSources, source]);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Filter by News Source</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {sourcesList.map(source => {
          const isActive = selectedSources.includes(source);
          return (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: isActive ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {source}
            </button>
          );
        })}
      </div>
    </div>
  );
}
