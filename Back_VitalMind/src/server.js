import { createServer } from "node:http";
import { app } from "./app.js";
import { connectDatabases, getDatabaseStatus } from "./config/databases.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabases();

  const server = createServer(app);
  server.listen(env.PORT, () => {
    const status = getDatabaseStatus();
    console.log(`VitalMind API running on http://localhost:${env.PORT}`);
    console.log(`MySQL: ${status.mysql.connected ? "connected" : "disconnected"}`);
  });
}

bootstrap().catch((error) => {
  console.error("Unable to start VitalMind API");
  console.error(error);
  process.exit(1);
});
