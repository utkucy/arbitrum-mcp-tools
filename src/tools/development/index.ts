import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";

export function registerDevelopmentTools(server: McpServer) {
  // 1. Transaction Simulation
  server.tool(
    "simulateTransaction",
    "Simulate Arbitrum transaction with state override and comprehensive analysis",
    {
      from: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
        .describe("From address (0x...)"),
      to: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
        .describe("To address (0x...)"),
      data: z
        .string()
        .regex(/^0x[a-fA-F0-9]*$/, "Invalid hex data format")
        .optional()
        .describe(
          "Optional transaction calldata (hex string, e.g., '0x1234...')"
        ),
      value: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/, "Invalid hex value format")
        .optional()
        .describe(
          "Optional value in wei (hex string, e.g., '0x16345785d8a0000')"
        ),
      gas: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/, "Invalid hex gas format")
        .optional()
        .describe("Optional gas limit (hex string, e.g., '0x5208')"),
      gasPrice: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/, "Invalid hex gas price format")
        .optional()
        .describe("Optional gas price (hex string, e.g., '0x4A817C800')"),
      maxFeePerGas: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/, "Invalid hex max fee format")
        .optional()
        .describe("Optional max fee per gas for EIP-1559 (hex string)"),
      maxPriorityFeePerGas: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/, "Invalid hex priority fee format")
        .optional()
        .describe(
          "Optional max priority fee per gas for EIP-1559 (hex string)"
        ),
      blockIdentifier: z
        .string()
        .optional()
        .describe(
          "Optional block identifier (number, hash, or 'latest'/'pending')"
        ),
      stateOverride: z
        .record(
          z.object({
            balance: z
              .string()
              .optional()
              .describe("Override account balance (hex)"),
            nonce: z
              .string()
              .optional()
              .describe("Override account nonce (hex)"),
            code: z.string().optional().describe("Override account code (hex)"),
            state: z
              .record(z.string())
              .optional()
              .describe("Override storage slots"),
            stateDiff: z
              .record(z.string())
              .optional()
              .describe("Diff storage slots"),
          })
        )
        .optional()
        .describe("State overrides for simulation (address -> override)"),
    },
    async ({
      from,
      to,
      data,
      value,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      blockIdentifier,
      stateOverride,
    }) => {
      try {
        // Build transaction object with only defined fields
        const transactionDetails: any = { from, to };

        // Only add data if it's provided and not empty
        if (data && data !== "0x" && data.length > 2) {
          transactionDetails.data = data;
        }

        // Add optional fields only if provided
        if (value) transactionDetails.value = value;
        if (gas) transactionDetails.gas = gas;

        // Handle gas pricing (legacy vs EIP-1559)
        if (maxFeePerGas || maxPriorityFeePerGas) {
          // EIP-1559 transaction
          if (maxFeePerGas) transactionDetails.maxFeePerGas = maxFeePerGas;
          if (maxPriorityFeePerGas)
            transactionDetails.maxPriorityFeePerGas = maxPriorityFeePerGas;
          // Don't use gasPrice with EIP-1559
        } else if (gasPrice) {
          // Legacy transaction
          transactionDetails.gasPrice = gasPrice;
        }

        // Prepare simulation options
        const simulationOptions: any = {};
        if (blockIdentifier) {
          simulationOptions.blockIdentifier = blockIdentifier;
        }
        if (stateOverride) {
          simulationOptions.stateOverride = stateOverride;
        }

        const simulation = await alchemy.transact.simulateAssetChanges(
          transactionDetails,
          Object.keys(simulationOptions).length > 0
            ? simulationOptions
            : undefined
        );

        // Handle simulation errors
        if (simulation.error && simulation.error.message) {
          let errorText = `❌ Simulation Error:\n📝 Message: ${simulation.error.message}`;

          if (simulation.error.code) {
            errorText += `\n🔢 Code: ${simulation.error.code}`;
          }

          if (simulation.changes && simulation.changes.length > 0) {
            errorText += `\n\n⚠️ Partial Asset Changes:\n${JSON.stringify(
              simulation.changes,
              null,
              2
            )}`;
          }

          if (simulation.gasUsed) {
            const gasDecimal = parseInt(simulation.gasUsed, 16);
            errorText += `\n⛽ Gas Used: ${
              simulation.gasUsed
            } (${gasDecimal.toLocaleString()} units)`;
          }

          return {
            content: [{ type: "text", text: errorText }],
          };
        }

        // Format successful simulation results
        let resultText = "✅ Simulation Successful!\n";

        // Add transaction summary
        resultText += `\n📊 Transaction Summary:`;
        resultText += `\n  From: ${from}`;
        resultText += `\n  To: ${to}`;
        if (value) {
          const valueEth = parseInt(value, 16) / 1e18;
          resultText += `\n  Value: ${value} (${valueEth} ETH)`;
        }
        if (transactionDetails.data) {
          resultText += `\n  Data: ${transactionDetails.data.slice(0, 42)}${
            transactionDetails.data.length > 42 ? "..." : ""
          }`;
        }

        // Gas information
        if (simulation.gasUsed) {
          const gasDecimal = parseInt(simulation.gasUsed, 16);
          resultText += `\n\n⛽ Gas Information:`;
          resultText += `\n  Gas Used: ${
            simulation.gasUsed
          } (${gasDecimal.toLocaleString()} units)`;

          // Estimate cost if gas price provided
          if (gasPrice || maxFeePerGas) {
            const effectiveGasPrice = gasPrice || maxFeePerGas;
            if (effectiveGasPrice) {
              const gasCost = gasDecimal * parseInt(effectiveGasPrice, 16);
              const gasCostEth = gasCost / 1e18;
              resultText += `\n  Estimated Cost: ${gasCostEth.toFixed(8)} ETH`;
            }
          }
        }

        // Asset changes
        if (simulation.changes && simulation.changes.length > 0) {
          resultText += `\n\n🔄 Asset Changes:`;
          simulation.changes.forEach((change, index) => {
            resultText += `\n\n  Change #${index + 1}:`;
            resultText += `\n${JSON.stringify(change, null, 4)}`;
          });
        } else {
          resultText += `\n\n🔄 Asset Changes: None detected`;
        }

        // Add state override info if used
        if (stateOverride && Object.keys(stateOverride).length > 0) {
          resultText += `\n\n🔧 State Overrides Applied:`;
          resultText += `\n${JSON.stringify(stateOverride, null, 2)}`;
        }

        return {
          content: [{ type: "text", text: resultText }],
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Simulation Failed:\n${errorMessage}\n\n💡 Check that:\n- Addresses are valid (0x format)\n- Hex values are properly formatted\n- The target contract exists\n- Gas limits are sufficient`,
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
