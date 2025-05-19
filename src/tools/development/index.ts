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
      gas: z
        .string()
        .optional()
        .describe("Optional gas limit as a hex string (e.g., '0x5208')"),
      gasPrice: z
        .string()
        .optional()
        .describe("Optional gas price as a hex string (e.g., '0x4A817C800')"),
      blockIdentifier: z
        .string()
        .optional()
        .describe(
          "Optional block identifier (number, hash, or tag like 'latest') to simulate the transaction in"
        ),
    },
    async ({ from, to, data, value, gas, gasPrice, blockIdentifier }) => {
      try {
        const transactionDetails: {
          from?: string;
          to: string;
          data?: string;
          value?: string;
          gas?: string;
          gasPrice?: string;
        } = { from, to, data };

        if (value) transactionDetails.value = value;
        if (gas) transactionDetails.gas = gas;
        if (gasPrice) transactionDetails.gasPrice = gasPrice;

        const simulation = await alchemy.transact.simulateAssetChanges(
          transactionDetails,
          blockIdentifier // This can be undefined, which is fine
        );

        if (simulation.error && simulation.error.message) {
          let errorText = `Simulation reported an error:\nMessage: ${simulation.error.message}`;
          if (simulation.changes && simulation.changes.length > 0) {
            errorText += `\nAsset Changes (potentially incomplete):\n${JSON.stringify(
              simulation.changes,
              null,
              2
            )}`;
          }
          if (simulation.gasUsed) {
            errorText += `\nGas Used: ${simulation.gasUsed}`;
          }
          return {
            content: [{ type: "text", text: errorText }],
          };
        }

        let resultText = "Simulation successful:";
        if (simulation.changes && simulation.changes.length > 0) {
          resultText += `\nAsset Changes:\n${JSON.stringify(
            simulation.changes,
            null,
            2
          )}`;
        } else {
          resultText += "\nNo asset changes detected.";
        }

        if (simulation.gasUsed) {
          resultText += `\n\nGas Used: ${simulation.gasUsed}`;
        } else {
          resultText += "\nGas used information not available.";
        }

        return {
          content: [{ type: "text", text: resultText }],
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
      from: z.string().optional().describe("Optional sender address"),
      data: z
        .string()
        .optional()
        .describe("Optional transaction data (hex string)"),
      value: z
        .string()
        .optional()
        .describe(
          "Optional value in wei as a string (e.g., '1000000000000000000')"
        ),
      gasPrice: z
        .string()
        .optional()
        .describe(
          "Optional gas price in wei as a string (e.g., '20000000000')"
        ),
      nonce: z
        .string()
        .optional()
        .describe("Optional transaction nonce as a string (e.g., '0', '1')"),
      type: z
        .number()
        .optional()
        .describe(
          "Optional EIP-2718 transaction type (e.g., 0 for legacy, 2 for EIP-1559)"
        ),
    },
    async ({ to, from, data, value, gasPrice, nonce, type }) => {
      try {
        const transactionToEstimate: {
          to: string;
          from?: string;
          data?: string;
          value?: string;
          gasPrice?: string;
          nonce?: number; // SDK expects number for nonce if passed in this object
          type?: number;
        } = { to };

        if (from) transactionToEstimate.from = from;
        if (data) transactionToEstimate.data = data;
        if (value) transactionToEstimate.value = value;
        if (gasPrice) transactionToEstimate.gasPrice = gasPrice;
        if (nonce) transactionToEstimate.nonce = parseInt(nonce, 10);
        if (type !== undefined) transactionToEstimate.type = type; // Check for undefined as 0 is a valid type

        const estimate = await alchemy.core.estimateGas(transactionToEstimate);
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
