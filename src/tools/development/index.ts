import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { alchemy, handleError } from "../common.js";

export function registerDevelopmentTools(server: McpServer) {
  // 1. Transaction Simulation
  server.tool(
    "simulateTransaction",
    "Simulate Arbitrum transaction with state override",
    {
      from: z.string().describe("From address"),
      to: z.string().describe("To address"),
      data: z.string().describe("Transaction calldata"),
      value: z.string().optional().describe("Value in wei (optional)"),
    },
    async ({ from, to, data, value }) => {
      try {
        const simulation = await alchemy.transact.simulateAssetChanges({
          from,
          to,
          data,
          value: value ? value : undefined,
        });

        return {
          content: [
            {
              type: "text",
              text: `Simulation result:\n${JSON.stringify(
                simulation.changes,
                null,
                2
              )}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Simulation failed: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 2. Gas Estimation
  server.tool(
    "estimateGas",
    "Estimate gas usage for a transaction",
    {
      to: z.string().describe("Destination address"),
      data: z.string().optional().describe("Optional transaction data"),
      value: z
        .string()
        .optional()
        .describe("Optional value in wei as a string"),
    },
    async ({ to, data, value }) => {
      try {
        const estimate = await alchemy.core.estimateGas({
          to,
          data,
          value: value ? value : undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: `Estimated gas: ${estimate.toString()}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 3. Stylus Integration (placeholder, as this seems to be a future feature)
  server.tool(
    "stylusIntegration",
    "Interact with Arbitrum Stylus smart contracts",
    {
      contractAddress: z.string().describe("Stylus contract address"),
      methodName: z.string().describe("Method name to call"),
      args: z.array(z.any()).optional().describe("Method arguments (optional)"),
    },
    async ({ contractAddress, methodName, args }) => {
      try {
        // Placeholder for Stylus integration
        // This would be implemented based on the actual Stylus SDK when available
        return {
          content: [
            {
              type: "text",
              text: `Stylus integration is a planned feature.
Contract: ${contractAddress}
Method: ${methodName}
Args: ${args ? JSON.stringify(args) : "None"}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Stylus operation failed: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );
}
