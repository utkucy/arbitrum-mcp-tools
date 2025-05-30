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
    "Cache a contract using the Stylus CacheManager",
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
    },
    async ({ subcommand, contractAddress, endpoint, path: projectPath }) => {
      try {
        const args = [`--address=${contractAddress}`, `--endpoint=${endpoint}`];

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

  // 9. Generate C code bindings
  server.tool(
    "generateStylusBindings",
    "Generate C code bindings for a Stylus contract",
    {
      input: z.string().describe("Input file or contract ABI"),
      outDir: z
        .string()
        .describe("Output directory for the generated bindings"),
      path: z
        .string()
        .optional()
        .describe("Path to the Stylus project (optional)"),
    },
    async ({ input, outDir, path: projectPath }) => {
      try {
        // We need to be in the project directory
        const output = await executeCargoStylusCommand(
          `cgen --input ${input} --out_dir ${outDir}`,
          projectPath
        );

        return {
          content: [
            {
              type: "text",
              text: `C bindings generation results:\n\n${output}`,
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
