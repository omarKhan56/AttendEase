import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },

  RESP: 2
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

try {
  await redisClient.connect();
  console.log("✅ Redis Connected");
} catch (err) {
  console.error("❌ Redis Connection Failed:", err);
}

export default redisClient;