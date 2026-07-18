require("dotenv").config();

const notificationQueue = require("./queues/notification.queue");

async function addTestJob() {
    try {
        const job = await notificationQueue.add("test-notification", {
            message: "Hello from BullMQ!",
            userId: "123",
        });

        console.log("JOB ADDED SUCCESSFULLY");
        console.log("Job ID:", job.id);

        process.exit(0);
    } catch (error) {
        console.error("FAILED TO ADD JOB:", error);
        process.exit(1);
    }
}

addTestJob();
