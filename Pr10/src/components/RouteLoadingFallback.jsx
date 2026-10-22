import React from 'react';

export default function RouteLoadingFallback({ message = "Loading component chunk..." }) {
  return (
    <div className="route-fallback-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      background: 'rgba(30, 41, 59, 0.4)',
      borderRadius: '16px',
      border: '1px dashed rgba(148, 163, 184, 0.25)',
      margin: '2rem 0'
    }}>
      <div className="lazy-spinner" style={{
        width: '44px',
        height: '44px',
        border: '4px solid rgba(59, 130, 246, 0.2)',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ marginTop: '1.25rem', color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
        {message}
      </p>
      <div style={{
        marginTop: '0.75rem',
        fontSize: '0.8rem',
        color: '#64748b',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '4px 12px',
        borderRadius: '12px'
      }}>
        Code-Split Dynamic Chunk (React.lazy + Suspense)
      </div>
    </div>
  );
}
