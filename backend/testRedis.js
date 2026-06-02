// testRedis.js

import { createClient } from "redis";

const client = createClient({
  url: "redis://localhost:6379",
});

client.on("error", console.error);

await client.connect();

console.log("CONNECTED");

console.log(await client.ping());

await client.quit();