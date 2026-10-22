/**
 * aiService.js - External AI Integration Service with Graceful Degradation & Rate Limiting
 * Practical 13: Secure Backend-Only API Invocation (OpenAI / Gemini)
 */

let OpenAI = null;
try {
    OpenAI = require('openai');
} catch (e) {
    // OpenAI will load once installed
}

// Supplementary Problem 2: In-Memory Rate Limiter (Max 10 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(clientIp) {
    const now = Date.now();
    const clientData = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

    if (now > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    }

    clientData.count++;
    rateLimitMap.set(clientIp, clientData);

    if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
        const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
        return { limited: true, retryAfter };
    }

    return { limited: false };
}

/**
 * Smart Fallback Engine: Provides structured, context-aware descriptions
 * if external AI API fails, times out, or has missing/invalid keys (Graceful Degradation).
 */
function generateFallbackDescription(title = '') {
    const lower = title.toLowerCase();
    let desc = '';
    let priority = 'medium';
    let deadline = '3 days';

    if (lower.includes('docker') || lower.includes('container')) {
        desc = `Containerize services with Docker. Write optimized Dockerfiles, configure multi-stage builds, and orchestrate with docker-compose.yml including bridge networks and volumes.`;
        priority = 'high';
        deadline = '2 days';
    } else if (lower.includes('ci') || lower.includes('github') || lower.includes('pipeline') || lower.includes('action')) {
        desc = `Establish automated GitHub Actions CI workflow (.github/workflows/ci.yml). Configure checkout, npm dependency install, linting, and automated Jest test execution on push to main.`;
        priority = 'high';
        deadline = '2 days';
    } else if (lower.includes('auth') || lower.includes('login') || lower.includes('jwt') || lower.includes('security')) {
        desc = `Implement secure authentication pipeline: bcrypt salt-hashing for passwords, JWT token signing with 1h expiry, and Express route protection middleware.`;
        priority = 'high';
        deadline = '1 day';
    } else if (lower.includes('cache') || lower.includes('redis') || lower.includes('performance')) {
        desc = `Implement server-side in-memory caching using node-cache. Cache GET requests with 60s TTL and enforce automatic write-invalidation on POST, PUT, and DELETE operations.`;
        priority = 'medium';
        deadline = '2 days';
    } else if (lower.includes('test') || lower.includes('jest') || lower.includes('bug') || lower.includes('fix')) {
        desc = `Write comprehensive automated test suites using Jest & Supertest. Assert expected HTTP response status codes, payload shapes, and edge cases.`;
        priority = 'medium';
        deadline = '1 day';
    } else {
        desc = `Structured roadmap for "${title}": Analyze technical specifications, implement clean modular architecture, conduct automated unit testing, and verify production deployment readiness.`;
        priority = 'medium';
        deadline = '3 days';
    }

    return {
        description: desc,
        suggestedPriority: priority,
        suggestedDeadline: deadline,
        fallback: true,
        source: 'Heuristic Rule-Based Fallback Engine (Graceful Degradation)',
        disclaimer: 'AI-Generated Content: Suggestions are generated automatically and should be reviewed and verified before use.'
    };
}

/**
 * Main AI Generation Function
 */
async function generateTaskDescription(title, clientIp = '127.0.0.1') {
    // 1. Enforce Rate Limiting (Supplementary Problem 2)
    const rateCheck = checkRateLimit(clientIp);
    if (rateCheck.limited) {
        const error = new Error(`Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute allowed. Try again in ${rateCheck.retryAfter}s.`);
        error.status = 429;
        error.retryAfter = rateCheck.retryAfter;
        throw error;
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // 2. If no valid API key or placeholder key, use Graceful Degradation Fallback
    if (!apiKey || apiKey === 'your_key_here' || apiKey.startsWith('sk-placeholder')) {
        console.log(`[AI Service] No valid external API key found. Applying Graceful Degradation fallback for "${title}".`);
        return generateFallbackDescription(title);
    }

    // 3. Attempt live OpenAI API invocation
    try {
        if (!OpenAI) OpenAI = require('openai');
        const client = new OpenAI({ apiKey });

        const prompt = `You are a technical project manager. For the task title "${title}", generate:
1. A concise, professional 2-sentence description of the work needed.
2. A suggested priority: low, medium, or high.
3. A suggested deadline (e.g. 1 day, 2 days, 1 week).
Return the result strictly as a JSON object with keys "description", "suggestedPriority", and "suggestedDeadline".`;

        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 200
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        return {
            description: parsed.description,
            suggestedPriority: parsed.suggestedPriority || 'medium',
            suggestedDeadline: parsed.suggestedDeadline || '2 days',
            fallback: false,
            source: 'OpenAI gpt-4o-mini',
            disclaimer: 'AI-Generated Content: Suggestions are generated automatically and should be reviewed and verified before use.'
        };
    } catch (err) {
        console.warn(`[AI Service] External API call failed (${err.message}). Activating Graceful Degradation.`);
        return generateFallbackDescription(title);
    }
}

module.exports = {
    generateTaskDescription,
    checkRateLimit,
    generateFallbackDescription
};
