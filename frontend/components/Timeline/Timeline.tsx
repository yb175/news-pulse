import React, { useState, useEffect } from 'react';
import TimelineItem from './TimelineItem';
import { TimelineCluster } from '../../lib/api';
import { TimelineListSkeleton } from '../Skeleton/SkeletonLoader';

interface TimelineProps {
  items: TimelineCluster[];
  isLoading: boolean;
  selectedClusterId: string | null;
  onSelectCluster: (id: string) => void;
}

export default function Timeline({ items, isLoading, selectedClusterId, onSelectCluster }: TimelineProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 4 items per page fits perfectly without long scrolling

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  if (isLoading) {
    return <TimelineListSkeleton />;
  }

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.length === 0 ? (
        <div className="paper-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No coverage found. Check your filters.
        </div>
      ) : (
        <>
          {/* Editorial Pagination Controls */}
          {totalPages > 1 && (
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '6px',
                padding: '4px 0'
              }}
            >
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                className="mono-font page-btn"
                style={{
                  height: '30px',
                  padding: '0 12px',
                  background: 'var(--surface-color)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  outline: 'none',
                  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                ← PREV
              </button>
              <span className="mono-font" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                PAGE {currentPage} OF {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                className="mono-font page-btn"
                style={{
                  height: '30px',
                  padding: '0 12px',
                  background: 'var(--surface-color)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  outline: 'none',
                  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                NEXT →
              </button>
            </div>
          )}

          <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedItems.map(item => (
              <TimelineItem
                key={item.clusterId}
                item={item}
                isSelected={selectedClusterId === item.clusterId}
                onSelect={onSelectCluster}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Mobile/Tablet Horizontal Carousel Styling */}
      <style>{`
        .page-btn:hover:not(:disabled) {
          background-color: #FFFDF4 !important;
          border-color: var(--text-primary) !important;
        }
        @media (max-width: 1024px) {
          .timeline-container {
            flex-direction: row !important;
            overflow-x: auto;
            padding-bottom: 12px;
            scroll-snap-type: x mandatory;
            gap: 16px !important;
          }
          .timeline-container > * {
            flex: 0 0 280px;
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  );
}
