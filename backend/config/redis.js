import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

await redisClient.connect();




// NEW: non-blocking pattern delete using SCAN instead of KEYS.
// Still not free on Upstash (each SCAN iteration is a billed command),
// but it doesn't block Redis the way KEYS does, and it's a drop-in
// replacement for the keys()+del(...) pattern used across the app.
export const deleteByPattern = async (pattern) => {
  let cursor = '0';
  let deletedCount = 0;
  do {
    const result = await redisClient.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });
    cursor = result.cursor;
    const keysBatch = result.keys;
    if (keysBatch.length > 0) {
      await redisClient.del(keysBatch);
      deletedCount += keysBatch.length;
    }
  } while (cursor !== '0');
  return deletedCount;
};

export default redisClient;