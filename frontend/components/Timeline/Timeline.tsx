import React, { useState } from 'react';
import TimelineItem from './TimelineItem';
import { TimelineCluster } from '../../lib/api';
import { TimelineListSkeleton } from '../Skeleton/TimelineListSkeleton';

interface TimelineProps {
  items: TimelineCluster[];
  isLoading: boolean;
  selectedClusterId: string | null;
  onSelectCluster: (id: string) => void;
}

export default function Timeline({ items, isLoading, selectedClusterId, onSelectCluster }: TimelineProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 4 items per page fits perfectly without long scrolling
  const [prevItemsLength, setPrevItemsLength] = useState(items.length);

  // Sync state on prop changes during render to avoid extra re-renders
  if (items.length !== prevItemsLength) {
    setPrevItemsLength(items.length);
    setCurrentPage(1);
  }

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
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                className="mono-font page-btn"
                style={{
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1
                }}
              >
                ← PREV
              </button>
              <span className="mono-font" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                PAGE {currentPage} OF {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                className="mono-font page-btn"
                style={{
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1
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
