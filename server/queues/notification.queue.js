const { Queue } = require("bullmq");
const redisClient = require("../config/redis");

const notificationQueue = new Queue("notificationQueue", {
    connection: redisClient,
    
});

module.exports = notificationQueue;