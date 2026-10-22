const BASE_URL = 'http://localhost:5000';

export const getTasks = () => fetch(`${BASE_URL}/tasks`).then(res => res.json());

export const createTask = (taskData) => fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
}).then(res => res.json());

export const updateTask = (id, taskData) => fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
}).then(res => res.json());

export const deleteTask = (id) => fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
}).then(res => res.json());
