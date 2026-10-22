import React from 'react';

/**
 * TaskAnalyticsChart - Heavy analytical visualization module.
 * Lazy loaded on demand to prevent adding weight to the initial bundle.
 */
export default function TaskAnalyticsChart({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: '#60a5fa', fontSize: '1.15rem' }}>
          📊 Heavy Analytics & Visual Metric Breakdown
        </h4>
        <span style={{ fontSize: '0.75rem', background: '#1e3a8a', color: '#93c5fd', padding: '3px 10px', borderRadius: '12px' }}>
          Lazy-Loaded Sub-Chunk
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>{total}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Tasks</div>
        </div>
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>{completed}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Completed</div>
        </div>
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171' }}>{pending}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending</div>
        </div>
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>{completionRate}%</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Progress</div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div style={{ width: '100%', height: '12px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{
          width: `${completionRate}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>
      <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
        Dynamic chunk loaded on-demand via React.lazy() inside Projects module
      </p>
    </div>
  );
}
