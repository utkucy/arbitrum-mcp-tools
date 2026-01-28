import { startServer } from "../../server.js";

export async function serveCommand(): Promise<void> {
  await startServer();
}
