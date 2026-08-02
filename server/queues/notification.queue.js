const { Queue } = require("bullmq");
const bullmqRedis = require("../config/bullmqRedis");

// connection 
const notificationQueue = new Queue("notificationQueue", {
    connection: bullmqRedis,
});

module.exports = notificationQueue;