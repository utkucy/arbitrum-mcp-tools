#!/usr/bin/env node

import { startServer, alchemy } from "./server.js";

// Re-export alchemy for backward compatibility
export { alchemy };

// Start the server when this file is executed directly
startServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
