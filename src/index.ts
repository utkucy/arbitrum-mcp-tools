#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

import { Alchemy, Network } from "alchemy-sdk";

import "dotenv/config";

// Create server instance
const server = new McpServer({
  name: "arbitrum",
  version: "1.0.0",
});

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY environment variable is required");
}

const alchemyConfig = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ARB_MAINNET,
};

export const alchemy = new Alchemy(alchemyConfig);

// Register all tools
registerAllTools(server);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Arbitrum MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
