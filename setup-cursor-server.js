import { homedir, platform } from "os";
import { join, dirname } from "path";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  appendFileSync,
} from "fs";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine OS and set appropriate config path
const isWindows = platform() === "win32";
const isMac = platform() === "darwin";
const cursorConfigPath = isWindows
  ? join(process.env.APPDATA, ".cursor", "mcp.json")
  : join(homedir(), ".cursor", "mcp.json");

// Setup logging
const LOG_FILE = join(__dirname, "cursor-setup.log");

function logToFile(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${isError ? "ERROR: " : ""}${message}\n`;
  try {
    appendFileSync(LOG_FILE, logMessage);
    // Output to console
    console.log(`${isError ? "ERROR: " : ""}${message}`);
  } catch (err) {
    // Last resort error handling
    console.error(`Failed to write to log file: ${err.message}`);
  }
}

// Helper to check if a package is installed
async function isPackageInstalled(packageName) {
  try {
    const { execSync } = await import("child_process");
    execSync(`npm list -g ${packageName} || npm list ${packageName}`, {
      stdio: "ignore",
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper to install a package if not already installed
async function ensurePackageInstalled(packageName) {
  if (await isPackageInstalled(packageName)) {
    logToFile(`Package ${packageName} is already installed.`);
    return true;
  }

  try {
    logToFile(`Installing ${packageName}...`);
    const { execSync } = await import("child_process");
    execSync(`npm install -g ${packageName}`, {
      stdio: "inherit",
    });
    logToFile(`Successfully installed ${packageName}.`);
    return true;
  } catch (error) {
    logToFile(`Failed to install ${packageName}: ${error.message}`, true);
    return false;
  }
}

async function setupLocal(config, nodePath) {
  // Use the local project path for the server
  const packagePath = join(__dirname, "build", "src", "index.js");
  logToFile(`Using local project path: ${packagePath}`);

  // Configure the Arbitrum MCP tools server
  config.mcpServers["arbitrum-mcp-tools"] = {
    command: nodePath,
    args: [packagePath],
    env: {
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || "YOUR_ALCHEMY_API_KEY",
    },
  };

  return config;
}

async function setupNpm(config, nodePath) {
  // Check if our package is already installed globally
  const packageName = "arbitrum-mcp-tools";
  await ensurePackageInstalled(packageName);

  // Use npm to find the global installation path of our package
  const { execSync } = await import("child_process");
  let packagePath;
  try {
    packagePath = execSync(`npm root -g`, { encoding: "utf8" }).trim();
    packagePath = join(packagePath, packageName, "build", "src", "index.js");
    logToFile(`Found package at: ${packagePath}`);
  } catch (error) {
    logToFile(
      `Error finding package path: ${error.message}. Using fallback path.`,
      true
    );
    // Fallback to using the current node path structure
    packagePath = join(
      dirname(nodePath),
      "..",
      "lib",
      "node_modules",
      packageName,
      "build",
      "src",
      "index.js"
    );
  }

  // Configure the Arbitrum MCP tools server
  config.mcpServers["arbitrum-mcp-tools"] = {
    command: nodePath,
    args: [packagePath],
    env: {
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || "YOUR_ALCHEMY_API_KEY",
    },
  };

  return config;
}

async function promptUser() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Choose setup type:\n1. Setup Locally (use current project files)\n2. Setup from NPM (install globally)\nEnter your choice (1 or 2): ",
      (answer) => {
        rl.close();
        resolve(answer.trim());
      }
    );
  });
}

(async function main() {
  try {
    // Get node path using process
    const nodePath = process.execPath;

    // Create default config structure
    let config = {
      mcpServers: {},
    };

    // Create the config directory if it doesn't exist
    const configDir = dirname(cursorConfigPath);
    if (!existsSync(configDir)) {
      logToFile(`Creating config directory: ${configDir}`);
      mkdirSync(configDir, { recursive: true });
    }

    // Read existing config if it exists
    if (existsSync(cursorConfigPath)) {
      logToFile(`Found existing Cursor MCP config at: ${cursorConfigPath}`);
      try {
        const configData = readFileSync(cursorConfigPath, "utf8");
        config = JSON.parse(configData);
        if (!config.mcpServers) {
          config.mcpServers = {};
        }
      } catch (error) {
        logToFile(
          `Error reading existing config: ${error.message}. Creating new config.`,
          true
        );
      }
    } else {
      logToFile(
        `No existing Cursor MCP config found. Creating new config at: ${cursorConfigPath}`
      );
    }

    // Prompt user for setup type
    const choice = await promptUser();

    if (choice === "1") {
      config = await setupLocal(config, nodePath);
    } else if (choice === "2") {
      config = await setupNpm(config, nodePath);
    } else {
      logToFile(`Invalid choice: ${choice}. Defaulting to local setup.`, true);
      config = await setupLocal(config, nodePath);
    }

    // Write the config back
    writeFileSync(cursorConfigPath, JSON.stringify(config, null, 2), "utf8");

    logToFile("Successfully updated Cursor MCP configuration!");
    logToFile(`Configuration location: ${cursorConfigPath}`);
    logToFile(
      "\nTo use the MCP tools:\n1. Restart Cursor if it's currently running\n2. The tools will be available in Cursor's MCP server list"
    );
  } catch (error) {
    logToFile(`Error updating Cursor configuration: ${error}`, true);
    process.exit(1);
  }
})();
