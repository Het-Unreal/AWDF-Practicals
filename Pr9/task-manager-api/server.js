const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');
const cache = require('./cache');

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
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

// --- Supplementary Problem 2: Debug Cache Statistics Endpoint ---
app.get('/cache-stats', (req, res) => {
    res.status(200).json(cache.getStats());
});

app.post('/cache/flush', (req, res) => {
    cache.flush();
    res.status(200).json({ message: 'In-memory cache completely flushed' });
});

// --- Auth Routes ---

// Validation helper for email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /register
app.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // 3 Input Validation Rules:
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

// POST /login
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

// GET /me
app.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// --- Task Routes ---

// Route-specific middleware to validate ObjectId format
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Task ID format' });
    }
    next();
};

// Validation middleware for task input
const validateTaskInput = (req, res, next) => {
    if (!req.body.title) {
        return res.status(400).json({ error: 'Task title is required in the request body' });
    }
    next();
};

// Apply auth middleware to all /tasks routes
app.use('/tasks', authMiddleware);

// GET /tasks - In-Memory Caching Implementation
app.get('/tasks', async (req, res, next) => {
    try {
        const bypassCache = req.query.nocache === 'true';

        // 1. Check cache first
        if (!bypassCache) {
            const cached = cache.get('all_tasks');
            if (cached.hit) {
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Source', 'node-cache');
                return res.status(200).json(cached.data);
            }
        }

        // 2. Cache miss: Query MongoDB database
        const tasks = await Task.find();

        // 3. Store in cache with 60s TTL
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

// GET /tasks/:id - Supplementary Problem 1: Separate Single-Task In-Memory Caching
app.get('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `task_${id}`;
        const bypassCache = req.query.nocache === 'true';

        // 1. Check individual task cache
        if (!bypassCache) {
            const cached = cache.get(cacheKey);
            if (cached.hit) {
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Source', 'node-cache');
                return res.status(200).json(cached.data);
            }
        }

        // 2. Query MongoDB
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // 3. Store in cache
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

// POST /tasks - Cache Invalidation on Creation
app.post('/tasks', validateTaskInput, async (req, res, next) => {
    try {
        const task = await Task.create(req.body);

        // Invalidate all tasks cache list
        cache.del('all_tasks');
        console.log('[Cache Invalidation] Cleared all_tasks key after task creation');

        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

// PUT /tasks/:id - Cache Invalidation on Update
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

        // Invalidate both all_tasks list and specific task key
        cache.del(['all_tasks', `task_${id}`]);
        console.log(`[Cache Invalidation] Cleared all_tasks and task_${id} keys after task update`);

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

// DELETE /tasks/:id - Cache Invalidation on Deletion
app.delete('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Invalidate both all_tasks list and specific task key
        cache.del(['all_tasks', `task_${id}`]);
        console.log(`[Cache Invalidation] Cleared all_tasks and task_${id} keys after task deletion`);

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
    console.log(`Server running on port ${port} with in-memory caching enabled`);
});
