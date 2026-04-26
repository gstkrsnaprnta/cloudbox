import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, "127.0.0.1", () => {
  console.log(`${env.appName} API running on ${env.appUrl} (${env.appEnv})`);
});
