const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err));

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

// Route-specific middleware to validate ObjectId format
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Task ID format' });
    }
    next();
};

// GET /tasks
app.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

// GET /tasks/:id
app.get('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// POST /tasks
app.post('/tasks', async (req, res, next) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

// PUT /tasks/:id
app.put('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
