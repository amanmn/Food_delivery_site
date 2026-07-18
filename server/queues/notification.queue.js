const { Queue } = require("bullmq");
const bullmqRedis = require("../config/bullmqRedis");

const notificationQueue = new Queue("notificationQueue", {
    connection: bullmqRedis,
});

module.exports = notificationQueue;