import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";

export function registerDevelopmentTools(server: McpServer) {
  // 1. Transaction Simulation
  server.tool(
    "simulateTransaction",
    "Simulate Arbitrum transaction with basic parameters",
    {
      from: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format")
        .describe("From address"),
      to: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address format")
        .describe("To address"),
      data: z.string().optional().describe("Transaction data (optional)"),
      value: z
        .string()
        .optional()
        .describe("Value in wei as hex string (optional)"),
      gas: z.string().optional().describe("Gas limit as hex string (optional)"),
    },
    async ({ from, to, data, value, gas }) => {
      try {
        // Build simple transaction object
        const tx: {
          from: string;
          to: string;
          data?: string;
          value?: string;
          gas?: string;
        } = { from, to };

        if (data) tx.data = data;
        if (value) tx.value = value;
        if (gas) tx.gas = gas;

        // Simulate the transaction
        const result = await alchemy.transact.simulateAssetChanges(tx);

        // Handle errors
        if (result.error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Error: ${result.error.message}`,
              },
            ],
          };
        }

        // Format simple response
        let response = "✅ Simulation Success\n\n";

        // Basic transaction info
        response += `From: ${from}\n`;
        response += `To: ${to}\n`;

        if (value) {
          const ethValue = (parseInt(value, 16) / 1e18).toFixed(4);
          response += `Value: ${ethValue} ETH\n`;
        }

        // Gas usage
        if (result.gasUsed) {
          const gasUsed = parseInt(result.gasUsed, 16).toLocaleString();
          response += `Gas Used: ${gasUsed}\n`;
        }

        // Asset changes
        if (result.changes && result.changes.length > 0) {
          response += `\nAsset Changes: ${result.changes.length} detected\n`;
          result.changes.forEach((change, i) => {
            response += `\nChange ${i + 1}:\n`;
            response += JSON.stringify(change, null, 2);
          });
        } else {
          response += "\nNo asset changes detected";
        }

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed: ${handleError(error)}`,
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
