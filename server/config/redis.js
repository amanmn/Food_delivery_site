const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_HOST
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
});

(async () => {
    await redisClient.connect();
})();

app.get("/redis-test", async (req, res) => {
    await redisClient.set("test", "working");
    const data = await redisClient.get("test");

    res.json({ data });
});

module.exports = redisClient;