import React, { useState } from 'react';

export default function CIPipelineWidget() {
  const [pipelineState, setPipelineState] = useState('passing'); // 'passing' or 'failed'

  const tests = [
    {
      id: 1,
      suite: 'Public Cache Endpoint',
      name: 'GET /cache-stats returns 200 OK with cache statistics',
      status: 'passed',
      duration: '42ms',
      assertion: 'expect(res.statusCode).toBe(200)'
    },
    {
      id: 2,
      suite: 'Authentication Enforcement',
      name: 'GET /tasks without token returns 401 Unauthorized',
      status: 'passed',
      duration: '31ms',
      assertion: "expect(res.body.error).toBe('No token provided')"
    },
    {
      id: 3,
      suite: 'Input Validation',
      name: 'POST /register missing password returns 400 Bad Request',
      status: pipelineState === 'failed' ? 'failed' : 'passed',
      duration: '65ms',
      assertion: pipelineState === 'failed' 
        ? 'Expected status 500, received 400 (Deliberately Broken Assertion)'
        : 'expect(res.statusCode).toBe(400)'
    },
    {
      id: 4,
      suite: 'Asynchronous Event Pipeline',
      name: 'POST /trigger-event-error traps background errors safely',
      status: 'passed',
      duration: '18ms',
      assertion: "expect(res.statusCode).toBe(200)"
    },
    {
      id: 5,
      suite: 'Audit Trail Verification',
      name: 'GET /event-logs returns 200 OK with event array',
      status: 'passed',
      duration: '24ms',
      assertion: 'expect(Array.isArray(res.body)).toBe(true)'
    }
  ];

  const allPassed = pipelineState === 'passing';

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      border: `1px solid ${allPassed ? 'rgba(52, 211, 153, 0.35)' : 'rgba(239, 68, 68, 0.4)'}`,
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, color: allPassed ? '#34d399' : '#f87171', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🚀 Practical 12: CI/CD Pipeline with GitHub Actions
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Automated testing, linting, and building triggered on <code style={{ color: '#38bdf8' }}>push</code> & <code style={{ color: '#c084fc' }}>pull_request</code> to <code style={{ color: '#facc15' }}>main</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPipelineState('failed')}
            style={{
              background: pipelineState === 'failed' ? '#dc2626' : 'rgba(71, 85, 105, 0.4)',
              border: '1px solid #ef4444',
              color: '#fff',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ❌ Simulate Broken Test
          </button>
          <button
            onClick={() => setPipelineState('passing')}
            style={{
              background: pipelineState === 'passing' ? '#059669' : 'rgba(71, 85, 105, 0.4)',
              border: '1px solid #10b981',
              color: '#fff',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ✔ Restore Fixed Pipeline
          </button>
        </div>
      </div>

      {/* Pipeline Status Banner */}
      <div style={{
        background: allPassed ? 'rgba(6, 78, 59, 0.3)' : 'rgba(127, 29, 29, 0.3)',
        border: `1px solid ${allPassed ? '#059669' : '#b91c1c'}`,
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>{allPassed ? '✅' : '❌'}</span>
          <div>
            <div style={{ fontWeight: 600, color: allPassed ? '#34d399' : '#f87171', fontSize: '0.95rem' }}>
              {allPassed ? 'All checks have passed (CI Workflow #42)' : 'Build & Automated Tests failed on push to main (CI Workflow #41)'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Commit <code style={{ color: '#e2e8f0' }}>f4a9b21</code> by Het Kathiriya | Branch: <code style={{ color: '#facc15' }}>main</code>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            background: allPassed ? '#047857' : '#991b1b',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {allPassed ? 'STATUS: PASSING' : 'STATUS: FAILED'}
          </span>
          <span style={{
            background: 'rgba(30, 41, 59, 0.8)',
            color: '#cbd5e1',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '0.75rem'
          }}>
            Duration: 38s
          </span>
        </div>
      </div>

      {/* CI Job Stages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Trigger Event</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8' }}>on: push, pull_request</div>
          <div style={{ fontSize: '0.72rem', color: '#bae6fd' }}>Target: branches [main]</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Job 1: lint</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#34d399' }}>✔ 0 Errors Detected</div>
          <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>Pre-requisite for test job</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '12px', borderRadius: '10px', borderLeft: `4px solid ${allPassed ? '#10b981' : '#ef4444'}` }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Job 2: build-and-test</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: allPassed ? '#34d399' : '#f87171' }}>
            {allPassed ? '✔ 5 / 5 Tests Passed' : '❌ 4 Passed, 1 Failed'}
          </div>
          <div style={{ fontSize: '0.72rem', color: allPassed ? '#6ee7b7' : '#fca5a5' }}>
            {allPassed ? 'Vite build + Jest Suite Green' : 'Assertion error in api.test.js'}
          </div>
        </div>
      </div>

      {/* Jest Test Suite Matrix */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
            🧪 Jest & Supertest Automated Test Execution Log (tests/api.test.js)
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Runner: Jest v30 on Node 18</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155', textAlign: 'left' }}>
              <th style={{ padding: '6px' }}>Test Description</th>
              <th style={{ padding: '6px' }}>Category / Suite</th>
              <th style={{ padding: '6px' }}>Duration</th>
              <th style={{ padding: '6px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                <td style={{ padding: '6px', color: '#f1f5f9' }}>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: t.status === 'passed' ? '#64748b' : '#f87171', fontFamily: 'monospace' }}>
                    {t.assertion}
                  </div>
                </td>
                <td style={{ padding: '6px', color: '#94a3b8' }}>{t.suite}</td>
                <td style={{ padding: '6px', color: '#cbd5e1' }}>{t.duration}</td>
                <td style={{ padding: '6px' }}>
                  <span style={{
                    background: t.status === 'passed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: t.status === 'passed' ? '#34d399' : '#f87171',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
