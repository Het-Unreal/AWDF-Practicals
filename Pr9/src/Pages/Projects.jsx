import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskItem from '../components/TaskItem';
import CacheBenchmarkWidget from '../components/CacheBenchmarkWidget';
import { 
  getTasksWithMetrics, 
  createTask, 
  updateTask, 
  deleteTask, 
  register, 
  login, 
  getMe 
} from '../api';

// Heavy analytical component loaded lazily on demand
const TaskAnalyticsChart = lazy(() => import('../components/TaskAnalyticsChart'));

export default function Projects() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastMetric, setLastMetric] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchTasksData = async (bypass = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getTasksWithMetrics(bypass);
      setTasks(res.data);
      setLastMetric(res);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!currentUser) {
        getMe()
          .then(data => {
            if (data.user) {
              setCurrentUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          })
          .catch(() => handleLogout());
      }
      fetchTasksData(false);
    }

    const handleAuthChange = () => {
      setCurrentUser(null);
      setTasks([]);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        await register(authName, authEmail, authPassword);
        showToast('Registration successful! Please log in.');
        setAuthMode('login');
        setAuthPassword('');
      } else {
        const res = await login(authEmail, authPassword);
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          setCurrentUser(res.user);
        } else {
          const me = await getMe();
          localStorage.setItem('user', JSON.stringify(me.user));
          setCurrentUser(me.user);
        }
        showToast(`Logged in as ${authEmail}`);
        fetchTasksData(false);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setTasks([]);
    setLastMetric(null);
    showToast('Logged out successfully.');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    
    // Optimistic UI Update
    const tempId = Date.now().toString();
    const optimisticTask = { _id: tempId, title: newTaskTitle, description: newTaskDescription, completed: false, isOptimistic: true };
    setTasks(prev => [...prev, optimisticTask]);
    
    try {
      const res = await createTask({ title: newTaskTitle, description: newTaskDescription });
      setTasks(prev => prev.map(t => t._id === tempId ? res : t));
      setNewTaskTitle('');
      setNewTaskDescription('');
      showToast('Task created successfully! (Cache invalidated)');
      // Refresh to capture cache invalidation metrics
      fetchTasksData(false);
    } catch (err) {
      setTasks(prev => prev.filter(t => t._id !== tempId));
      showToast('Failed to create task.');
      setError(err.message);
    }
  };

  const handleToggle = useCallback(async (task) => {
    try {
      const res = await updateTask(task._id, { completed: !task.completed });
      setTasks(prev => prev.map(t => t._id === task._id ? res : t));
      showToast('Task updated successfully! (Cache invalidated)');
      fetchTasksData(false);
    } catch (err) {
      showToast('Failed to update task.');
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast('Task deleted successfully! (Cache invalidated)');
      fetchTasksData(false);
    } catch (err) {
      showToast('Failed to delete task.');
    }
  }, []);

  return (
    <section>
      <h2>Practical 9: In-Memory Caching and Query Optimization</h2>
      
      {toastMsg && (
        <div style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          color: '#fff',
          marginBottom: '20px',
          borderRadius: '8px',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Auth Panel */}
      {!currentUser ? (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '480px',
          margin: '0 auto 2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <button 
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              style={{
                background: authMode === 'login' ? 'var(--accent)' : 'transparent',
                color: authMode === 'login' ? '#fff' : 'var(--text-muted)',
                padding: '0.5rem 1rem'
              }}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              style={{
                background: authMode === 'register' ? 'var(--accent)' : 'transparent',
                color: authMode === 'register' ? '#fff' : 'var(--text-muted)',
                padding: '0.5rem 1rem'
              }}
            >
              Register
            </button>
          </div>

          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
            {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h3>

          {authError && <div style={{ marginBottom: '1rem' }}><ErrorMessage message={authError} /></div>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 0 }}>
            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="user@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password (Min 6 chars)</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" disabled={authLoading} style={{ marginTop: '0.5rem' }}>
              {authLoading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Sign Up')}
            </button>
          </form>
        </div>
      ) : (
        <div>
          {/* User Status Bar & Logout */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back, </span>
              <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{currentUser.name || currentUser.email}</strong>
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{currentUser.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '0.5rem 1rem'
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Practical 9: In-Memory Caching & Performance Benchmark Widget */}
          <CacheBenchmarkWidget lastMetric={lastMetric} onRefresh={fetchTasksData} />

          {/* Analytical Module Toggle */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowAnalytics((prev) => !prev)}
              style={{
                background: showAnalytics ? '#2563eb' : 'rgba(30, 41, 59, 0.7)',
                border: '1px solid #3b82f6',
                color: '#f8fafc',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              {showAnalytics ? '✕ Hide Task Analytics' : '📊 Show Task Analytics (Lazy Loaded)'}
            </button>
          </div>

          {showAnalytics && (
            <Suspense fallback={
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px dashed #3b82f6',
                borderRadius: '12px',
                color: '#94a3b8',
                marginBottom: '1.5rem'
              }}>
                ⏳ Loading TaskAnalyticsChart chunk dynamically via React.lazy()...
              </div>
            }>
              <TaskAnalyticsChart tasks={tasks} />
            </Suspense>
          )}

          {/* Task Form */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Task Title" 
              value={newTaskTitle} 
              onChange={(e) => setNewTaskTitle(e.target.value)} 
              required
            />
            <input 
              type="text" 
              placeholder="Description" 
              value={newTaskDescription} 
              onChange={(e) => setNewTaskDescription(e.target.value)} 
            />
            <button type="submit">Create Task</button>
          </form>

          {loading && <Spinner />}

          {error && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <ErrorMessage message={error} />
              <button onClick={() => fetchTasksData(false)} style={{ marginTop: '0.5rem' }}>Retry</button>
            </div>
          )}

          {/* Tasks List */}
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tasks.map((task) => (
              <TaskItem 
                key={task._id} 
                task={task} 
                onToggle={handleToggle} 
                onDelete={handleDelete} 
              />
            ))}
          </ul>
          {!loading && tasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks found. Create your first task above!</p>}
        </div>
      )}
    </section>
  );
}