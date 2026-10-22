const BASE_URL = 'http://localhost:5000';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res) => {
    if (res.status === 401) {
        // Token expired or missing, clear local storage and dispatch auth change
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Session expired. Please log in again.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
};

export const register = (name, email, password) => fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
}).then(handleResponse);

export const login = (email, password) => fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
}).then(handleResponse);

export const getMe = () => fetch(`${BASE_URL}/me`, {
    headers: getHeaders()
}).then(handleResponse);

export const getTasks = () => fetch(`${BASE_URL}/tasks`, {
    headers: getHeaders()
}).then(handleResponse);

export const createTask = (taskData) => fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
}).then(handleResponse);

export const updateTask = (id, taskData) => fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
}).then(handleResponse);

export const deleteTask = (id) => fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
}).then(handleResponse);
