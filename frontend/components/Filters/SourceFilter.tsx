import React, { useState } from 'react';

interface SourceFilterProps {
  selectedSources: string[];
  onChange: (sources: string[]) => void;
}

const filterBtnStyle: React.CSSProperties = {
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
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background-color 150ms ease, border-color 150ms ease'
};

const backdropBtnStyle: React.CSSProperties = {
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  zIndex: 998,
  background: 'transparent',
  border: 'none',
  cursor: 'default'
};

const dropdownContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: 0,
  background: 'var(--surface-color)',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  padding: '12px',
  zIndex: 999,
  minWidth: '200px',
  boxShadow: '2px 2px 0px var(--border-color)'
};

export const SOURCES_LIST = ['BBC News', 'The Guardian', 'NPR'];

export default function SourceFilter({ selectedSources, onChange }: SourceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      onChange(selectedSources.filter(s => s !== source));
    } else {
      onChange([...selectedSources, source]);
    }
  };

  const getLabel = () => {
    if (selectedSources.length === 0) return 'All Sources';
    if (selectedSources.length === SOURCES_LIST.length) return 'All Sources';
    return `${selectedSources.length} Selected`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={filterBtnStyle}
        className="filter-btn"
      >
        <span>Sources: {getLabel()}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Accessible transparent backdrop button to close dropdown */}
          <button 
            type="button"
            onClick={() => setIsOpen(false)} 
            aria-label="Close sources filter dropdown"
            style={backdropBtnStyle}
          />
          <div style={dropdownContainerStyle}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }} className="mono-font">
              Select Sources
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SOURCES_LIST.map((source: string) => {
                const isActive = selectedSources.includes(source);
                return (
                  <label 
                    key={source} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      fontSize: '13px', 
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleSource(source)}
                      style={{
                        accentColor: 'var(--accent-red)',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>{source}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
      <style>{`
        .filter-btn:hover {
          background-color: #FFFDF4 !important;
          border-color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
