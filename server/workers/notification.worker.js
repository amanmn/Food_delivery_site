const { Worker } = require("bullmq");
const bullmqRedis = require("../config/bullmqRedis");

const notificationWorker = new Worker(
    "notificationQueue",
    async (job) => {
        
        console.log("Processing notification job:", job.data);
    },
    {
        connection: bullmqRedis
    },
);

notificationWorker.on("completed", (job) => {
    console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on("failed", (job, error) => {
    console.error(`Notification job ${job.id} failed:`, error.message)
});

console.log("Notification worker started and listening for jobs...");