const IORedis = require("ioredis");

// connection to the redis server
const bullmqRedis = new IORedis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,

    maxRetriesPerRequest: null,
});

bullmqRedis.on("connect", () => {
    console.log("BullMQ Redis connected");
});

bullmqRedis.on("ready", () => {
    console.log("BullMQ Redis ready");
});

bullmqRedis.on("error", () => {
    console.log("BullMQ Redis error");
});

module.exports = bullmqRedis;