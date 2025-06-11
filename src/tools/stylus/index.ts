import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execSync } from "child_process";
import { handleError } from "../common.js";
import * as path from "path";
import * as fs from "fs";

// Helper function to execute cargo stylus commands with directory handling
async function executeCargoStylusCommand(
  command: string,
  cwd?: string,
  args: string[] = []
): Promise<string> {
  try {
    const fullCommand = `cargo stylus ${command} ${args.join(" ")}`;
    const options: { encoding: BufferEncoding; cwd?: string } = {
      encoding: "utf8",
    };

    if (cwd) {
      // Check if directory exists
      if (!fs.existsSync(cwd)) {
        fs.mkdirSync(cwd, { recursive: true });
      }
      options.cwd = cwd;
    }

    const output = execSync(fullCommand, options);
    return output;
  } catch (error: any) {
    if (error.stdout) {
      return error.stdout;
    }
    throw new Error(`Failed to execute cargo stylus command: ${error.message}`);
  }
}

export function registerStylusTools(server: McpServer) {
  // 1. Create a new Stylus project
  server.tool(
    "createStylusProject",
    "Create a new Cargo Stylus project",
    {
      projectName: z.string().describe("Project name"),
      path: z
        .string()
        .optional()
        .describe("Path to create the project (optional)"),
    },
    async ({ projectName, path: projectPath }) => {
      try {
        // For 'new' command, we need to be in the parent directory where we want to create the project
        const output = await executeCargoStylusCommand(
          `new ${projectName}`,
          projectPath
        );

        return {
          content: [
            {
              type: "text",
              text: `Project created successfully:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating Stylus project: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 2. Initialize a Stylus project
  server.tool(
    "initStylusProject",
    "Initialize a Stylus project in the current directory",
    {
      path: z
        .string()
        .optional()
        .describe("Path to initialize the project (optional)"),
    },
    async ({ path: projectPath }) => {
      try {
        // For 'init' command, we need to be in the directory where we want to initialize the project
        const output = await executeCargoStylusCommand("init", projectPath);

        return {
          content: [
            {
              type: "text",
              text: `Project initialized successfully:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error initializing Stylus project: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 3. Export a Solidity ABI
  server.tool(
    "exportStylusAbi",
    "Export a Solidity ABI for a Stylus contract",
    {
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
    },
    async ({ path: projectPath }) => {
      try {
        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          "export-abi",
          projectPath
        );

        return {
          content: [
            {
              type: "text",
              text: `ABI exported successfully:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error exporting Stylus ABI: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 4. Check a Stylus contract
  server.tool(
    "checkStylusContract",
    "Check if a Stylus contract is valid for deployment",
    {
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
    },
    async ({ path: projectPath }) => {
      try {
        // We need to be in the project directory
        const output = await executeCargoStylusCommand("check", projectPath);

        return {
          content: [
            {
              type: "text",
              text: `Contract check results:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error checking Stylus contract: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 5. Deploy a Stylus contract
  server.tool(
    "deployStylusContract",
    "Deploy a Stylus contract to the Arbitrum network. Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH from environment variables for authentication.",
    {
      endpoint: z.string().describe("RPC endpoint URL"),
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
      estimateGas: z
        .boolean()
        .optional()
        .describe("Only estimate gas instead of deploying (optional)"),
    },
    async ({ endpoint, path: projectPath, estimateGas }) => {
      try {
        const args = [`--endpoint=${endpoint}`];

        // Get authentication method from environment variables
        const privateKey = process.env.STYLUS_PRIVATE_KEY;
        const privateKeyPath = process.env.STYLUS_PRIVATE_KEY_PATH;
        const keystorePath = process.env.STYLUS_KEYSTORE_PATH;

        // At least one authentication method must be provided
        if (privateKey) {
          args.push(`--private-key=${privateKey}`);
        } else if (privateKeyPath) {
          args.push(`--private-key-path=${privateKeyPath}`);
        } else if (keystorePath) {
          args.push(`--keystore-path=${keystorePath}`);
        } else {
          throw new Error(
            "Authentication required: Set one of STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables"
          );
        }

        if (estimateGas) {
          args.push("--estimate-gas");
        }

        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          "deploy",
          projectPath,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: `${
                estimateGas ? "Gas estimation" : "Deployment"
              } results:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error ${
                estimateGas ? "estimating gas" : "deploying"
              } Stylus contract: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 6. Verify a Stylus contract deployment
  server.tool(
    "verifyStylusContract",
    "Verify the deployment of a Stylus contract",
    {
      deploymentTx: z.string().describe("Deployment transaction hash"),
      endpoint: z.string().optional().describe("RPC endpoint URL (optional)"),
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
    },
    async ({ deploymentTx, endpoint, path: projectPath }) => {
      try {
        const args = [`--deployment-tx=${deploymentTx}`];

        if (endpoint) {
          args.push(`--endpoint=${endpoint}`);
        }

        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          "verify",
          projectPath,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: `Verification results:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error verifying Stylus contract: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 7. Activate a deployed Stylus contract
  server.tool(
    "activateStylusContract",
    "Activate an already deployed Stylus contract. Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH from environment variables for authentication.",
    {
      contractAddress: z.string().describe("Deployed contract address"),
      endpoint: z.string().describe("RPC endpoint URL"),
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
    },
    async ({ contractAddress, endpoint, path: projectPath }) => {
      try {
        const args = [`--address=${contractAddress}`, `--endpoint=${endpoint}`];

        // Get authentication method from environment variables
        const privateKey = process.env.STYLUS_PRIVATE_KEY;
        const privateKeyPath = process.env.STYLUS_PRIVATE_KEY_PATH;
        const keystorePath = process.env.STYLUS_KEYSTORE_PATH;

        // At least one authentication method must be provided
        if (privateKey) {
          args.push(`--private-key=${privateKey}`);
        } else if (privateKeyPath) {
          args.push(`--private-key-path=${privateKeyPath}`);
        } else if (keystorePath) {
          args.push(`--keystore-path=${keystorePath}`);
        } else {
          throw new Error(
            "Authentication required: Set one of STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables"
          );
        }

        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          "activate",
          projectPath,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: `Activation results:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error activating Stylus contract: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 8. Cache a Stylus contract
  server.tool(
    "cacheStylusContract",
    "Cache a contract using the Stylus CacheManager. Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH from environment variables for authentication.",
    {
      subcommand: z
        .enum(["bid", "status", "suggest-bid", "help"])
        .describe("Cache subcommand to execute"),
      contractAddress: z.string().describe("Contract address to cache"),
      endpoint: z.string().describe("RPC endpoint URL"),
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
      bidAmount: z
        .string()
        .optional()
        .describe("Bid amount (required for 'bid' subcommand)"),
    },
    async ({
      subcommand,
      contractAddress,
      endpoint,
      path: projectPath,
      bidAmount,
    }) => {
      try {
        const args = [`--endpoint=${endpoint}`];

        // Get authentication method from environment variables
        const privateKey = process.env.STYLUS_PRIVATE_KEY;
        const privateKeyPath = process.env.STYLUS_PRIVATE_KEY_PATH;
        const keystorePath = process.env.STYLUS_KEYSTORE_PATH;

        // At least one authentication method must be provided
        if (privateKey) {
          args.push(`--private-key=${privateKey}`);
        } else if (privateKeyPath) {
          args.push(`--private-key-path=${privateKeyPath}`);
        } else if (keystorePath) {
          args.push(`--keystore-path=${keystorePath}`);
        } else {
          throw new Error(
            "Authentication required: Set one of STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables"
          );
        }

        // Add contract address
        args.push(contractAddress);

        // Add bid amount if provided and required
        if (subcommand === "bid") {
          if (!bidAmount) {
            throw new Error("Bid amount is required for 'bid' subcommand");
          }
          args.push(bidAmount);
        }

        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          `cache ${subcommand}`,
          projectPath,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: `Cache ${subcommand} results:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error caching Stylus contract: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "prepareStylusCgen",
    "Prepare ABI JSON for cargo stylus cgen command",
    {
      projectPath: z.string().describe("The project path"),
      outputPath: z
        .string()
        .describe("The output file for cgen-compatible JSON"),
      rustFeatures: z
        .string()
        .optional()
        .describe(
          "Rust crate's features list. Required to include feature specific ABI"
        ),
    },
    async ({ projectPath, outputPath, rustFeatures }) => {
      try {
        const args: string[] = ["--json"];

        if (rustFeatures) {
          args.push(`--rust-features="${rustFeatures}"`);
        }

        // Export ABI first
        const abiOutput = await executeCargoStylusCommand(
          "export-abi",
          projectPath,
          args
        );

        // Parse the output to extract contract name and ABI
        const lines = abiOutput.split("\n");
        let abiJson = "";
        let extractedContractName = "Contract"; // default fallback

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Look for contract name in header
          if (line.includes("=======") && line.includes(":")) {
            const headerMatch = line.match(/=======\s*<[^>]*>:(\w+)\s*=======/);
            if (headerMatch) {
              extractedContractName = headerMatch[1];
            }
          }

          // Look for ABI JSON (starts with [ and contains "type")
          if (line.trim().startsWith("[") && line.includes('"type"')) {
            abiJson = line.trim();
            break;
          }
        }

        if (!abiJson) {
          throw new Error("Could not extract ABI JSON from export-abi output");
        }

        // Parse and validate ABI
        let abi;
        try {
          abi = JSON.parse(abiJson);
        } catch (parseError) {
          throw new Error(`Invalid ABI JSON: ${parseError}`);
        }

        // Create cgen-compatible structure
        const cgenFormat = {
          contracts: {
            [`${extractedContractName}.sol`]: {
              [extractedContractName]: {
                abi: abi,
              },
            },
          },
        };

        const formattedJson = JSON.stringify(cgenFormat, null, 2);

        // Write to output file
        const fs = await import("fs");
        await fs.promises.writeFile(outputPath, formattedJson);

        return {
          content: [
            {
              type: "text",
              text: `Successfully prepared cgen-compatible ABI JSON for contract "${extractedContractName}".\nOutput saved to: ${outputPath}\n\nYou can now run:\ncargo stylus cgen ${outputPath} ./generated/\n\nGenerated structure:\n${formattedJson}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error preparing cgen ABI: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 9. Generate C code bindings
  server.tool(
    "generateStylusBindings",
    "Generate C code bindings for a Stylus contract from project source",
    {
      projectPath: z.string().describe("The Stylus project path"),
      outDir: z
        .string()
        .describe("Output directory for the generated C bindings"),
      rustFeatures: z
        .string()
        .optional()
        .describe("Rust crate's features list for ABI generation"),
      abiOutputPath: z
        .string()
        .optional()
        .describe(
          "Path to save the prepared ABI JSON (optional, temp file used if not provided)"
        ),
      keepAbiFile: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Keep the generated ABI JSON file after C binding generation"
        ),
    },
    async ({
      projectPath,
      outDir,
      rustFeatures,
      abiOutputPath,
      keepAbiFile,
    }) => {
      try {
        let generatedAbiPath = "";

        // Generate ABI from the project

        const args: string[] = ["--json"];

        if (rustFeatures) {
          args.push(`--rust-features="${rustFeatures}"`);
        }

        // Export ABI first
        const abiOutput = await executeCargoStylusCommand(
          "export-abi",
          projectPath,
          args
        );

        // Parse the output to extract contract name and ABI
        const lines = abiOutput.split("\n");
        let abiJson = "";
        let extractedContractName = "Contract"; // default fallback

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Look for contract name in header
          if (line.includes("=======") && line.includes(":")) {
            const headerMatch = line.match(/=======\s*<[^>]*>:(\w+)\s*=======/);
            if (headerMatch) {
              extractedContractName = headerMatch[1];
            }
          }

          // Look for ABI JSON (starts with [ and contains "type")
          if (line.trim().startsWith("[") && line.includes('"type"')) {
            abiJson = line.trim();
            break;
          }
        }

        if (!abiJson) {
          throw new Error("Could not extract ABI JSON from export-abi output");
        }

        // Parse and validate ABI
        let abi;
        try {
          abi = JSON.parse(abiJson);
        } catch (parseError) {
          throw new Error(`Invalid ABI JSON: ${parseError}`);
        }

        // Create cgen-compatible structure
        const cgenFormat = {
          contracts: {
            [`${extractedContractName}.sol`]: {
              [extractedContractName]: {
                abi: abi,
              },
            },
          },
        };

        const formattedJson = JSON.stringify(cgenFormat, null, 2);

        // Determine output path for ABI JSON
        const fs = await import("fs");
        const path = await import("path");

        if (abiOutputPath) {
          generatedAbiPath = abiOutputPath;
        } else {
          // Use temp file
          const os = await import("os");
          generatedAbiPath = path.join(
            os.tmpdir(),
            `${extractedContractName}_cgen_abi.json`
          );
        }

        // Write ABI JSON file
        await fs.promises.writeFile(generatedAbiPath, formattedJson);

        // Now generate C bindings using the ABI JSON
        const cgenOutput = await executeCargoStylusCommand(
          `cgen ${generatedAbiPath} ${outDir}`
        );

        // Clean up temp file if not keeping it
        if (generatedAbiPath && !keepAbiFile && !abiOutputPath) {
          try {
            const fs = await import("fs");
            await fs.promises.unlink(generatedAbiPath);
          } catch (cleanupError) {
            // Non-fatal error, just log it
            console.warn(
              `Warning: Could not clean up temp ABI file: ${cleanupError}`
            );
          }
        }

        let resultMessage = `C bindings generated successfully!\n\nOutput directory: ${outDir}\n\n${cgenOutput}`;

        if (keepAbiFile || abiOutputPath) {
          resultMessage += `\n\nABI JSON saved to: ${generatedAbiPath}`;
        }

        resultMessage += `\n\nGenerated from project: ${projectPath}`;

        return {
          content: [
            {
              type: "text",
              text: resultMessage,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating C bindings: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );
  // 10. Replay a transaction in GDB
  server.tool(
    "replayStylusTransaction",
    "Replay a Stylus transaction in GDB debugger",
    {
      txHash: z.string().describe("Transaction hash to replay"),
      endpoint: z.string().optional().describe("RPC endpoint URL (optional)"),
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
    },
    async ({ txHash, endpoint, path: projectPath }) => {
      try {
        const args = [`--tx=${txHash}`];

        if (endpoint) {
          args.push(`--endpoint=${endpoint}`);
        }

        args.push("--use-native-tracer");

        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          "replay",
          projectPath,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: `Transaction replay results:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error replaying transaction: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 11. Trace a transaction
  server.tool(
    "traceStylusTransaction",
    "Trace a Stylus transaction",
    {
      txHash: z.string().describe("Transaction hash to trace"),
      endpoint: z.string().optional().describe("RPC endpoint URL (optional)"),
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
    },
    async ({ txHash, endpoint, path: projectPath }) => {
      try {
        const args = [`--tx=${txHash}`];

        if (endpoint) {
          args.push(`--endpoint=${endpoint}`);
        }

        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          "trace",
          projectPath,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: `Transaction trace results:\n\n${output}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error tracing transaction: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );
}
