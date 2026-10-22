const taskEvents = require('./events');

// In-memory event audit log buffer for frontend visualization & test verification
const eventLogs = [];

/**
 * Register all event listeners on the taskEvents bus
 */
function registerEventListeners() {
    console.log('[Event System] Registering native EventEmitter listeners...');

    // 1. Task Created Listener (with 2-second simulated background delay - Supplementary Problem 3)
    taskEvents.on('task-created', (payload) => {
        const workerStartTime = new Date().toISOString();
        const { task, user, apiTimestamp } = payload;
        
        console.log(`[Event Received] 'task-created' event received at ${workerStartTime}`);
        console.log(`[Background Worker] Simulating async email/push notification for "${task.title}" (2000ms delay)...`);

        // Asynchronous non-blocking background job using Node.js event loop
        setTimeout(() => {
            const workerDoneTime = new Date().toISOString();
            console.log(`[Notification] Task "${task.title}" notification dispatched successfully at ${workerDoneTime}`);
            console.log(`[Timestamp Proof] API responded at ${apiTimestamp} | Worker completed at ${workerDoneTime}`);

            eventLogs.unshift({
                id: Date.now().toString(),
                eventType: 'task-created',
                taskTitle: task.title,
                taskId: task._id,
                user: user ? (user.name || user.email) : 'System User',
                apiTimestamp: apiTimestamp,
                workerStartTime: workerStartTime,
                workerDoneTime: workerDoneTime,
                latencyMs: 2000,
                status: 'COMPLETED_ASYNC',
                details: `Email & push alerts dispatched for task: "${task.title}"`
            });

            // Keep log size within bounds
            if (eventLogs.length > 50) eventLogs.pop();
        }, 2000);
    });

    // 2. Task Deleted Listener (Supplementary Problem 1)
    taskEvents.on('task-deleted', (payload) => {
        const workerStartTime = new Date().toISOString();
        const { taskId, title, user, apiTimestamp } = payload;

        console.log(`[Audit Listener] 'task-deleted' event received for ID: ${taskId} at ${workerStartTime}`);

        setTimeout(() => {
            const workerDoneTime = new Date().toISOString();
            console.log(`[Audit Log] Task "${title}" (ID: ${taskId}) archived and cleanup completed at ${workerDoneTime}`);

            eventLogs.unshift({
                id: Date.now().toString(),
                eventType: 'task-deleted',
                taskTitle: title || 'Deleted Task',
                taskId: taskId,
                user: user ? (user.name || user.email) : 'System User',
                apiTimestamp: apiTimestamp,
                workerStartTime: workerStartTime,
                workerDoneTime: workerDoneTime,
                latencyMs: 500,
                status: 'ARCHIVED_ASYNC',
                details: `System audit record created and cache references cleaned for task ${taskId}`
            });

            if (eventLogs.length > 50) eventLogs.pop();
        }, 500);
    });

    // 3. Error Event Listener (Supplementary Problem 2: Unhandled Error Safety)
    taskEvents.on('error', (err) => {
        const errTime = new Date().toISOString();
        console.error(`[Event Error Caught] Handled gracefully at ${errTime}:`, err.message);

        eventLogs.unshift({
            id: Date.now().toString(),
            eventType: 'error',
            taskTitle: 'Event Pipeline Exception',
            taskId: 'N/A',
            user: 'Event Loop',
            apiTimestamp: errTime,
            workerStartTime: errTime,
            workerDoneTime: errTime,
            latencyMs: 0,
            status: 'CAUGHT_ERROR',
            details: `Safe error handler trapped: ${err.message}`
        });

        if (eventLogs.length > 50) eventLogs.pop();
    });

    console.log('[Event System] All 3 listeners successfully registered.');
}

module.exports = {
    registerEventListeners,
    getEventLogs: () => eventLogs,
    clearEventLogs: () => { eventLogs.length = 0; }
};
