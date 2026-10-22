import React, { useState } from 'react';
import { generateAIDescription } from '../api';

export default function AIAssistantWidget({ onApplySuggestion }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [editableDesc, setEditableDesc] = useState('');

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!taskTitle.trim()) {
      setErrorMsg('Please enter a task title to generate a description.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const data = await generateAIDescription(taskTitle.trim());
      setResult(data);
      setEditableDesc(data.description || '');
    } catch (err) {
      if (err.message && err.message.includes('429')) {
        setErrorMsg('⏳ Rate Limit Exceeded: Max 10 AI requests per minute allowed. Please wait a moment.');
      } else {
        // Fallback simulated gracefully on frontend if offline
        const fallbackData = {
          description: `Strategic implementation plan for "${taskTitle}": Break down functional specifications, build component modules, and verify production deployment.`,
          suggestedPriority: 'medium',
          suggestedDeadline: '3 days',
          fallback: true,
          source: 'Frontend Graceful Fallback Engine'
        };
        setResult(fallbackData);
        setEditableDesc(fallbackData.description);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (onApplySuggestion && result) {
      onApplySuggestion({
        title: taskTitle,
        description: editableDesc,
        priority: result.suggestedPriority,
        deadline: result.suggestedDeadline
      });
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(236, 72, 153, 0.35)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f472b6', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✨ Practical 13: AI API Integration into Web Application
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Secure Server-Side AI Assistance (<code style={{ color: '#ec4899' }}>OpenAI / Gemini</code>) with Graceful Degradation & Rate Limiting
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid #db2777',
            color: '#f472b6',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}>
            API Key: Server-Side (.env only)
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
            Rate Limit: 10 req/min
          </span>
        </div>
      </div>

      {/* Supplementary Problem 3: Mandatory AI Content Disclaimer Banner */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.82rem',
        color: '#fde68a'
      }}>
        <span style={{ fontSize: '1.1rem' }}>⚠️</span>
        <div>
          <strong>Responsible AI Notice:</strong> Suggestions are generated automatically by artificial intelligence models. Content should be reviewed and verified by the user before creating or assigning tasks.
        </div>
      </div>

      {/* Input Prompt Section */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="e.g. Implement CI/CD pipeline or Add JWT token authentication"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid #475569',
            color: '#f8fafc',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            fontSize: '0.9rem'
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: loading ? '#9d174d' : 'linear-gradient(135deg, #db2777, #be185d)',
            border: 'none',
            color: '#fff',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {loading ? '⏳ Generating...' : '✨ Generate with AI'}
        </button>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '8px 12px',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.82rem'
        }}>
          {errorMsg}
        </div>
      )}

      {/* Supplementary Problem 1: Loading State UI */}
      {loading && (
        <div style={{
          padding: '1.75rem',
          textAlign: 'center',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '10px',
          border: '1px dashed #ec4899',
          color: '#f472b6',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖 💭</div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Calling Backend AI Service...</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            Parsing task context, determining priority level, and crafting technical description
          </div>
        </div>
      )}

      {/* AI Suggestion Output (Editable Suggestion) */}
      {result && !loading && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(71, 85, 105, 0.8)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                AI Recommendation for: <span style={{ color: '#38bdf8' }}>{taskTitle}</span>
              </span>
              <span style={{
                background: result.fallback ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: result.fallback ? '#fbbf24' : '#34d399',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600
              }}>
                {result.source}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{
                background: '#4c1d95',
                color: '#ddd6fe',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                Priority: {result.suggestedPriority?.toUpperCase()}
              </span>
              <span style={{
                background: '#1e3a8a',
                color: '#bfdbfe',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                Est: {result.suggestedDeadline}
              </span>
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
            Editable AI Description (modify before adding to task list):
          </label>
          <textarea
            value={editableDesc}
            onChange={(e) => setEditableDesc(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f8fafc',
              padding: '8px 12px',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              resize: 'vertical',
              marginBottom: '10px'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={handleApply}
              style={{
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📥 Use in Task Creation Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
