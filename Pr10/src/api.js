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

export const getTasks = (bypassCache = false) => fetch(`${BASE_URL}/tasks${bypassCache ? '?nocache=true' : ''}`, {
    headers: getHeaders()
}).then(handleResponse);

export const getTasksWithMetrics = async (bypassCache = false) => {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/tasks${bypassCache ? '?nocache=true' : ''}`, {
        headers: getHeaders()
    });
    const t1 = performance.now();
    const cacheStatus = res.headers.get('X-Cache') || 'MISS';
    const cacheSource = res.headers.get('X-Cache-Source') || 'MongoDB';
    const data = await handleResponse(res);
    return {
        data: Array.isArray(data) ? data : [],
        cacheStatus,
        cacheSource,
        durationMs: (t1 - t0).toFixed(1)
    };
};

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

// Practical 9 Cache Functions
export const getCacheStats = () => fetch(`${BASE_URL}/cache-stats`).then(res => res.json());
export const flushCache = () => fetch(`${BASE_URL}/cache/flush`, { method: 'POST' }).then(res => res.json());

// Practical 10 EventEmitter Background Processing Functions
export const getEventLogs = () => fetch(`${BASE_URL}/event-logs`).then(res => res.json());
export const clearEventLogs = () => fetch(`${BASE_URL}/event-logs/clear`, { method: 'POST' }).then(res => res.json());
export const triggerEventError = () => fetch(`${BASE_URL}/trigger-event-error`, { method: 'POST' }).then(res => res.json());
