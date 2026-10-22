import React from 'react';

/**
 * TaskItem - Memoized task component.
 * Profiler Optimization: Wrapped in React.memo to eliminate redundant re-renders
 * of task items when parent form inputs (newTaskTitle, newTaskDescription) change.
 */
const TaskItem = React.memo(function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        opacity: task.isOptimistic ? 0.5 : 1
      }}
    >
      <div>
        <strong style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.title}
        </strong>
        <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: 'var(--text-muted)' }}>
          {task.description}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onToggle(task)}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
        <button
          onClick={() => onDelete(task._id)}
          style={{ background: '#ef4444', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          Delete
        </button>
      </div>
    </li>
  );
});

export default TaskItem;
