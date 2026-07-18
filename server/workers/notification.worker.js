const { Worker } = require("bullmq");
const redisClient = require("../config/redis");

const notificationWorker = new Worker(
    "notificationQueue",
    async (job) => {
        console.log("Processing notification job:", job.data);
    },
    {
        connection: redisClient
    },
);

notificationWorker.on("completed", (job) => {
    console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on("failed", (job, error) => {
    console.error(`Notification job ${job.id} failed:`, error.message)
});

console.log("Notification worker started and listening for jobs...");