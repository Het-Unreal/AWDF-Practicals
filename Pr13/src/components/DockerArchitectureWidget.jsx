import React from 'react';

export default function DockerArchitectureWidget() {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(56, 189, 248, 0.35)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🐳 Practical 11: Containerization with Docker & Docker Compose
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Multi-Container Full-Stack Orchestration via <code style={{ color: '#38bdf8' }}>docker-compose up</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            background: 'rgba(14, 165, 233, 0.15)',
            border: '1px solid #0284c7',
            color: '#38bdf8',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}>
            Network: app-network (bridge)
          </span>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #059669',
            color: '#34d399',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}>
            Volume: mongo-data
          </span>
        </div>
      </div>

      {/* 3 Container Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Frontend Container */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Frontend Container</span>
            <span style={{ fontSize: '0.7rem', background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Port 5173</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc', margin: '4px 0' }}>task-frontend</div>
          <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>● Multi-Stage Build (Alpine)</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Image Size: 68 MB (Saved 414 MB)</div>
        </div>

        {/* Backend Container */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Backend Container</span>
            <span style={{ fontSize: '0.7rem', background: '#7c3aed', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Port 5000</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc', margin: '4px 0' }}>task-backend</div>
          <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>● Node 18 Alpine (REST API)</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>DNS: mongodb:27017</div>
        </div>

        {/* MongoDB Container */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Database Service</span>
            <span style={{ fontSize: '0.7rem', background: '#059669', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Port 27017</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#f8fafc', margin: '4px 0' }}>task-mongodb</div>
          <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>● Official mongo:latest</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Named Volume: mongo-data</div>
        </div>
      </div>

      {/* Multi-Stage & Named Volume Details Table */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
          📦 Multi-Stage Optimization & Container Topology Breakdown
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155', textAlign: 'left' }}>
              <th style={{ padding: '6px' }}>Service Name</th>
              <th style={{ padding: '6px' }}>Host Port</th>
              <th style={{ padding: '6px' }}>Docker Base</th>
              <th style={{ padding: '6px' }}>Optimization / Volume</th>
              <th style={{ padding: '6px' }}>Network Link</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
              <td style={{ padding: '6px', color: '#38bdf8', fontWeight: 600 }}>task-frontend</td>
              <td style={{ padding: '6px' }}>5173:5173</td>
              <td style={{ padding: '6px', color: '#94a3b8' }}>node:18-alpine</td>
              <td style={{ padding: '6px', color: '#34d399' }}>Multi-Stage (build ➔ minimal preview)</td>
              <td style={{ padding: '6px', color: '#cbd5e1' }}>depends_on: backend</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
              <td style={{ padding: '6px', color: '#c084fc', fontWeight: 600 }}>task-backend</td>
              <td style={{ padding: '6px' }}>5000:5000</td>
              <td style={{ padding: '6px', color: '#94a3b8' }}>node:18-alpine</td>
              <td style={{ padding: '6px', color: '#facc15' }}>.dockerignore (excluded node_modules & .env)</td>
              <td style={{ padding: '6px', color: '#cbd5e1' }}>depends_on: mongodb</td>
            </tr>
            <tr>
              <td style={{ padding: '6px', color: '#34d399', fontWeight: 600 }}>task-mongodb</td>
              <td style={{ padding: '6px' }}>27017:27017</td>
              <td style={{ padding: '6px', color: '#94a3b8' }}>mongo:latest</td>
              <td style={{ padding: '6px', color: '#38bdf8' }}>Named Volume: mongo-data:/data/db</td>
              <td style={{ padding: '6px', color: '#cbd5e1' }}>DNS hostname: mongodb</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
