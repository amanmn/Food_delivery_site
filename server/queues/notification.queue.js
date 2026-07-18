const { Queue } = require("bullmq");
const bullmqRedis = require("../config/bullmqRedis");

const notificationQueue = new Queue("notificationQueue", {
    connection: bullmqRedis,
});

notificationQueue.add("test-notification",{
    message:"Hello from BullMQ!",
    userId:"12345"
});

module.exports = notificationQueue;