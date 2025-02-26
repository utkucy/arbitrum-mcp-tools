import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAccountAnalysisTools } from "./accountAnalysis/index.js";
import { registerChainDataTools } from "./chainData/index.js";
import { registerContractInteractionTools } from "./contractInteraction/index.js";
import { registerCrossChainTools } from "./crossChain/index.js";
import { registerDevelopmentTools } from "./development/index.js";
import { registerBatchOperationsTools } from "./batchOperations/index.js";
import { registerStylusTools } from "./stylus/index.js";

export function registerAllTools(server: McpServer) {
  // Register all tool categories
  registerAccountAnalysisTools(server);
  registerChainDataTools(server);
  registerContractInteractionTools(server);
  registerCrossChainTools(server);
  registerDevelopmentTools(server);
  registerBatchOperationsTools(server);
  registerStylusTools(server);
}
