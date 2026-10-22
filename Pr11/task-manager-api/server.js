const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');
const cache = require('./cache');
const taskEvents = require('./events');
const { registerEventListeners, getEventLogs, clearEventLogs } = require('./listeners');

const app = express();
const port = 5000;

// Register background EventEmitter listeners
registerEventListeners();

// Enable CORS
app.use(cors());

// Connect to MongoDB (Supports Docker Compose service discovery 'mongodb' or local fallback)
const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/taskmanager';
mongoose.connect(mongoUri)
    .then(() => console.log(`MongoDB connected successfully to ${mongoUri}`))
    .catch((err) => console.error('MongoDB connection error:', err));

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

// Auth Middleware
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// --- Debug / Monitoring Endpoints ---

// Cache Statistics
app.get('/cache-stats', (req, res) => {
    res.status(200).json(cache.getStats());
});

app.post('/cache/flush', (req, res) => {
    cache.flush();
    res.status(200).json({ message: 'In-memory cache completely flushed' });
});

// Event Logs / Audit trail endpoint for Practical 10
app.get('/event-logs', (req, res) => {
    res.status(200).json(getEventLogs());
});

app.post('/event-logs/clear', (req, res) => {
    clearEventLogs();
    res.status(200).json({ message: 'Event logs cleared' });
});

// Supplementary Problem 2: Trigger deliberate background error to verify safety
app.post('/trigger-event-error', (req, res) => {
    taskEvents.emit('error', new Error('Simulated background worker exception trapped safely without crashing process'));
    res.status(200).json({ message: 'Simulated event error dispatched and handled' });
});

// --- Auth Routes ---

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Validation failed: name, email, and password are required' });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Validation failed: Invalid email format' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Validation failed: Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', userId: user._id, name: user.name, email: user.email });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Email already exists' });
        next(err);
    }
});

app.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        next(err);
    }
});

app.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// --- Task Routes ---

const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Task ID format' });
    }
    next();
};

const validateTaskInput = (req, res, next) => {
    if (!req.body.title) {
        return res.status(400).json({ error: 'Task title is required in the request body' });
    }
    next();
};

app.use('/tasks', authMiddleware);

// GET /tasks - Cached read
app.get('/tasks', async (req, res, next) => {
    try {
        const bypassCache = req.query.nocache === 'true';

        if (!bypassCache) {
            const cached = cache.get('all_tasks');
            if (cached.hit) {
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Source', 'node-cache');
                return res.status(200).json(cached.data);
            }
        }

        const tasks = await Task.find();

        if (!bypassCache) {
            cache.set('all_tasks', tasks);
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Source', 'MongoDB');
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

// GET /tasks/:id - Single-task cached read
app.get('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `task_${id}`;
        const bypassCache = req.query.nocache === 'true';

        if (!bypassCache) {
            const cached = cache.get(cacheKey);
            if (cached.hit) {
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Source', 'node-cache');
                return res.status(200).json(cached.data);
            }
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (!bypassCache) {
            cache.set(cacheKey, task);
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Source', 'MongoDB');
        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// POST /tasks - Asynchronous EventEmitter Processing (Practical 10 Core)
app.post('/tasks', validateTaskInput, async (req, res, next) => {
    try {
        const task = await Task.create(req.body);

        // Invalidate in-memory cache
        cache.del('all_tasks');

        // Capture timestamp before dispatching response
        const apiTimestamp = new Date().toISOString();
        console.log(`[API] Response sent at ${apiTimestamp}`);

        // 1. Send HTTP response immediately (Fast non-blocking response)
        res.status(201).json(task);

        // 2. Emit event asynchronously after HTTP response is sent
        taskEvents.emit('task-created', {
            task,
            user: req.user,
            apiTimestamp
        });
    } catch (err) {
        next(err);
    }
});

// PUT /tasks/:id - Invalidate cache
app.put('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndUpdate(id, req.body, { 
            new: true, 
            runValidators: true 
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        cache.del(['all_tasks', `task_${id}`]);
        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// DELETE /tasks/:id - Emits 'task-deleted' Event (Supplementary Problem 1)
app.delete('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        cache.del(['all_tasks', `task_${id}`]);

        const apiTimestamp = new Date().toISOString();
        console.log(`[API] Delete response sent at ${apiTimestamp}`);

        // 1. Send response immediately
        res.status(200).json({ message: 'Task deleted successfully' });

        // 2. Emit 'task-deleted' event for background audit logging & archiving
        taskEvents.emit('task-deleted', {
            taskId: id,
            title: task.title,
            user: req.user,
            apiTimestamp
        });
    } catch (err) {
        next(err);
    }
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port} with EventEmitter background processing enabled`);
});
