const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,                // for Redis Cloud
        rejectUnauthorized: false,
    },
});

redisClient.on("connect", () => {
    console.log("Redis connected");
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Redis connection failed:", err);
    }
})();

module.exports = redisClient;