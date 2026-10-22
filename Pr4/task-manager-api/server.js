const express = require('express');
const app = express();
const port = 5000;

// In-memory array for tasks
let tasks = [];
let currentId = 1;

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to reject POST/PUT requests without Content-Type: application/json
const requireJsonContent = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.is('application/json')) {
            return res.status(400).json({ error: 'Content-Type must be application/json' });
        }
    }
    next();
};

app.use(requireJsonContent);

// Route-specific middleware to validate task ID
const validateTaskId = (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Task ID must be a valid number' });
    }
    req.taskId = id;
    next();
};

// GET /tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

// POST /tasks
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    const newTask = {
        id: currentId++,
        title,
        description: description || '',
        completed: false
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /tasks/:id
app.put('/tasks/:id', validateTaskId, (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    const { title, description, completed } = req.body;
    
    // Update fields
    if (title !== undefined) tasks[taskIndex].title = title;
    if (description !== undefined) tasks[taskIndex].description = description;
    if (completed !== undefined) tasks[taskIndex].completed = completed;
    
    res.status(200).json(tasks[taskIndex]);
});

// DELETE /tasks/:id
app.delete('/tasks/:id', validateTaskId, (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    tasks.splice(taskIndex, 1);
    res.status(200).json({ message: 'Task deleted successfully' });
});

// Simulate a route that throws an error to test the global error handler
app.get('/error', (req, res, next) => {
    next(new Error('This is a simulated error!'));
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
