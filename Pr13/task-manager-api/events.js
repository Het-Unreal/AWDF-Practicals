const EventEmitter = require('events');

/**
 * TaskEvents - Native Node.js EventEmitter for asynchronous,
 * decoupled background processing without external message brokers.
 */
class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents();

// Increase max listeners for scalable event subscription
taskEvents.setMaxListeners(20);

module.exports = taskEvents;
