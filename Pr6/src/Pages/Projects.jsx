import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getTasks, createTask, updateTask, deleteTask } from '../api';

export default function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchTasksData = () => {
    setLoading(true);
    setError(null);
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

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
      showToast('Task created successfully!');
    } catch (err) {
      setTasks(prev => prev.filter(t => t._id !== tempId));
      showToast('Failed to create task.');
      setError(err.message);
    }
  };

  const handleToggle = async (task) => {
    try {
      const res = await updateTask(task._id, { completed: !task.completed });
      setTasks(prev => prev.map(t => t._id === task._id ? res : t));
      showToast('Task updated successfully!');
    } catch (err) {
      showToast('Failed to update task.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast('Task deleted successfully!');
    } catch (err) {
      showToast('Failed to delete task.');
    }
  };

  if (loading) return <Spinner />;
  
  if (error) {
    return (
      <section style={{ textAlign: 'center' }}>
        <ErrorMessage message={error} />
        <button onClick={fetchTasksData}>Retry</button>
      </section>
    );
  }

  return (
    <section>
      <h2>Task Management</h2>
      
      {toastMsg && (
        <div style={{ padding: '10px', background: 'var(--accent)', color: 'white', marginBottom: '15px', borderRadius: '5px' }}>
          {toastMsg}
        </div>
      )}

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

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li key={task._id} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '10px', borderBottom: '1px solid var(--border-color)',
            opacity: task.isOptimistic ? 0.5 : 1
          }}>
            <div>
              <strong style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</strong>
              <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: 'gray' }}>{task.description}</p>
            </div>
            <div>
              <button onClick={() => handleToggle(task)} style={{ marginRight: '10px' }}>
                {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button onClick={() => handleDelete(task._id)} style={{ background: '#ef4444' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && <p>No tasks found.</p>}
    </section>
  );
}