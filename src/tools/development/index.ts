import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";

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
}
