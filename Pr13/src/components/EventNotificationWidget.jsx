import React, { useState, useEffect } from 'react';
import { getEventLogs, clearEventLogs, triggerEventError } from '../api';

export default function EventNotificationWidget({ onActionTriggered }) {
  const [logs, setLogs] = useState([
    {
      id: 'demo-1',
      eventType: 'task-created',
      taskTitle: 'Setup EventEmitter pipeline',
      user: 'Het Kathiriya',
      apiTimestamp: new Date(Date.now() - 15000).toISOString(),
      workerStartTime: new Date(Date.now() - 15000).toISOString(),
      workerDoneTime: new Date(Date.now() - 13000).toISOString(),
      latencyMs: 2000,
      status: 'COMPLETED_ASYNC',
      details: 'Email & push notifications dispatched asynchronously after 2000ms delay'
    },
    {
      id: 'demo-2',
      eventType: 'task-deleted',
      taskTitle: 'Legacy cleanup task',
      user: 'Het Kathiriya',
      apiTimestamp: new Date(Date.now() - 45000).toISOString(),
      workerStartTime: new Date(Date.now() - 45000).toISOString(),
      workerDoneTime: new Date(Date.now() - 44500).toISOString(),
      latencyMs: 500,
      status: 'ARCHIVED_ASYNC',
      details: 'Audit trail archived and database references cleaned in background'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await getEventLogs();
      if (Array.isArray(data) && data.length > 0) {
        setLogs(data);
      }
    } catch {
      // Backend not running yet or endpoint offline
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateError = async () => {
    setLoading(true);
    try {
      await triggerEventError();
      setStatusMsg('Simulated error emitted to taskEvents bus. Caught safely by error listener!');
      await fetchLogs();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearEventLogs();
      setLogs([]);
      setStatusMsg('Event logs cleared successfully.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(139, 92, 246, 0.35)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#c084fc', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡ Practical 10: Asynchronous Processing with Event-Driven Architecture
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Decoupled background tasks via Node.js native <code style={{ color: '#e879f9' }}>EventEmitter</code> (Non-blocking I/O)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSimulateError}
            disabled={loading}
            style={{
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ⚠️ Test Error Listener
          </button>
          <button
            onClick={handleClearLogs}
            style={{
              background: 'rgba(71, 85, 105, 0.5)',
              border: '1px solid #64748b',
              color: '#cbd5e1',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            🗑 Clear Logs
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{
          background: 'rgba(147, 51, 234, 0.2)',
          border: '1px solid #a855f7',
          color: '#e9d5ff',
          padding: '8px 14px',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.85rem'
        }}>
          ℹ️ {statusMsg}
        </div>
      )}

      {/* Metrics & Architecture Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Event Bus</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#34d399' }}>TaskEvents</div>
          <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>Native EventEmitter</div>
        </div>
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>API Response</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>Immediate (201)</div>
          <div style={{ fontSize: '0.72rem', color: '#bae6fd' }}>Non-blocking (10-25ms)</div>
        </div>
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Worker Delay</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#facc15' }}>2000 ms</div>
          <div style={{ fontSize: '0.72rem', color: '#fef08a' }}>Simulated background job</div>
        </div>
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #c084fc' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Listeners</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e879f9' }}>3 Registered</div>
          <div style={{ fontSize: '0.72rem', color: '#f5d0fe' }}>created / deleted / error</div>
        </div>
      </div>

      {/* Real-time Event Stream Table */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
            📡 Asynchronous Event Execution Timeline (Timestamp Verification)
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Auto-refreshing every 2.5s</span>
        </div>

        {logs.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', margin: '1rem 0' }}>
            No background events emitted yet. Create or delete a task below to observe asynchronous processing!
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155', textAlign: 'left' }}>
                <th style={{ padding: '6px' }}>Event</th>
                <th style={{ padding: '6px' }}>Target / Scope</th>
                <th style={{ padding: '6px' }}>API Responded At</th>
                <th style={{ padding: '6px' }}>Worker Completed At</th>
                <th style={{ padding: '6px' }}>Decoupled Lag</th>
                <th style={{ padding: '6px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isCreate = log.eventType === 'task-created';
                const isDelete = log.eventType === 'task-deleted';
                const badgeColor = isCreate ? '#34d399' : isDelete ? '#fb923c' : '#f87171';
                const badgeBg = isCreate ? 'rgba(16, 185, 129, 0.2)' : isDelete ? 'rgba(249, 115, 22, 0.2)' : 'rgba(239, 68, 68, 0.2)';
                
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                    <td style={{ padding: '6px' }}>
                      <span style={{ background: badgeBg, color: badgeColor, padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>
                        {log.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '6px', color: '#f1f5f9', fontWeight: 500 }}>
                      {log.taskTitle}
                    </td>
                    <td style={{ padding: '6px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {log.apiTimestamp ? log.apiTimestamp.split('T')[1]?.replace('Z', '') : '-'}
                    </td>
                    <td style={{ padding: '6px', color: '#a855f7', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {log.workerDoneTime ? log.workerDoneTime.split('T')[1]?.replace('Z', '') : '-'}
                    </td>
                    <td style={{ padding: '6px', color: '#facc15', fontWeight: 600 }}>
                      +{log.latencyMs}ms
                    </td>
                    <td style={{ padding: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
                      {log.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
