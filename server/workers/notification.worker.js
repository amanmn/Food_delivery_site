const { Worker } = require("bullmq");
const bullmqRedis = require("../config/bullmqRedis");
const { sendOrderConfirmationEmail } = require("../utils/nodemailer");

const notificationWorker = new Worker(
    "notificationQueue",
    async (job) => {
        console.log("Processing job:", job.name);
        console.log("Job data:", job.data);

        if (job.name === "order-created") {
            const { email, orderId, message } = job.data;

            await sendOrderConfirmationEmail(
                email, orderId, message
            );

            console.log(`Order email sent to ${email}`)
        }
    },
    {
        connection: bullmqRedis
    },
);

notificationWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

notificationWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
});

console.log("Notification worker started");