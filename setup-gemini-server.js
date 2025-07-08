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

// Utility to locate an existing Gemini installation directory and settings.json
function locateGeminiSettings() {
  const pathsToCheck = [];

  const currentPlatform = platform();

  if (currentPlatform === "win32") {
    if (process.env.APPDATA) {
      pathsToCheck.push(join(process.env.APPDATA, "Gemini"));
    }
    pathsToCheck.push(join(homedir(), ".gemini"));
  } else if (currentPlatform === "darwin") {
    // macOS typical locations
    pathsToCheck.push(join(homedir(), ".gemini"));
    pathsToCheck.push(
      join(homedir(), "Library", "Application Support", "Gemini")
    );
  } else {
    // Linux / other unix-like systems
    pathsToCheck.push(join(homedir(), ".gemini"));
  }

  // Return the first directory that exists
  for (const dir of pathsToCheck) {
    if (existsSync(dir)) {
      return join(dir, "settings.json");
    }
  }

  return null; // Gemini not found
}

// Setup logging
const LOG_FILE = join(__dirname, "gemini-setup.log");

function logToFile(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${isError ? "ERROR: " : ""}${message}\n`;
  try {
    appendFileSync(LOG_FILE, logMessage);
    // Output to console for visibility
    console.log(`${isError ? "ERROR: " : ""}${message}`);
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
}

// Check if an npm package is installed (globally or locally)
async function isPackageInstalled(packageName) {
  try {
    const { execSync } = await import("child_process");
    execSync(`npm list -g ${packageName} || npm list ${packageName}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

// Install the package globally if needed
async function ensurePackageInstalled(packageName) {
  if (await isPackageInstalled(packageName)) {
    logToFile(`Package ${packageName} is already installed.`);
    return true;
  }

  try {
    logToFile(`Installing ${packageName}...`);
    const { execSync } = await import("child_process");
    execSync(`npm install -g ${packageName}`, { stdio: "inherit" });
    logToFile(`Successfully installed ${packageName}.`);
    return true;
  } catch (error) {
    logToFile(`Failed to install ${packageName}: ${error.message}`, true);
    return false;
  }
}

async function setupLocal(config, nodePath) {
  // Use the local build output for the server
  const packagePath = join(__dirname, "build", "src", "index.js");
  logToFile(`Using local project path: ${packagePath}`);

  config.mcpServers["arbitrumMCPTools"] = {
    command: nodePath,
    args: [packagePath],
    env: {
      PATH: `${dirname(nodePath)}:${process.env.PATH}`,
      NODE_PATH: join(dirname(nodePath), "..", "lib", "node_modules"),
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || "YOUR_ALCHEMY_API_KEY",
      ARBISCAN_API_KEY: process.env.ARBISCAN_API_KEY || "YOUR_ARBISCAN_API_KEY",
      STYLUS_PRIVATE_KEY: process.env.STYLUS_PRIVATE_KEY || "",
      STYLUS_PRIVATE_KEY_PATH: process.env.STYLUS_PRIVATE_KEY_PATH || "",
      STYLUS_KEYSTORE_PATH: process.env.STYLUS_KEYSTORE_PATH || "",
    },
  };

  return config;
}

async function setupNpm(config, nodePath) {
  const packageName = "arbitrum-mcp-tools";
  await ensurePackageInstalled(packageName);

  // Locate the global installation path
  const { execSync } = await import("child_process");
  let packagePath;
  try {
    packagePath = execSync("npm root -g", { encoding: "utf8" }).trim();
    packagePath = join(packagePath, packageName, "build", "src", "index.js");
    logToFile(`Found package at: ${packagePath}`);
  } catch (error) {
    logToFile(
      `Error finding package path: ${error.message}. Using fallback path.`,
      true
    );
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

  config.mcpServers["arbitrumMCPTools"] = {
    command: nodePath,
    args: [packagePath],
    env: {
      PATH: `${dirname(nodePath)}:${process.env.PATH}`,
      NODE_PATH: join(dirname(nodePath), "..", "lib", "node_modules"),
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || "YOUR_ALCHEMY_API_KEY",
      ARBISCAN_API_KEY: process.env.ARBISCAN_API_KEY || "YOUR_ARBISCAN_API_KEY",
      STYLUS_PRIVATE_KEY: process.env.STYLUS_PRIVATE_KEY || "",
      STYLUS_PRIVATE_KEY_PATH: process.env.STYLUS_PRIVATE_KEY_PATH || "",
      STYLUS_KEYSTORE_PATH: process.env.STYLUS_KEYSTORE_PATH || "",
    },
  };

  return config;
}

// Prompt the user to choose between local or npm setup
async function promptUser() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(
      "Choose setup type:\n1. Setup Locally (recommended if you plan to modify the tools)\n2. Setup from NPM (recommended for general use)\nEnter your choice (1 or 2): ",
      (answer) => {
        rl.close();
        resolve(answer.trim());
      }
    );
  });
}

(async function main() {
  try {
    const nodePath = process.execPath;

    // Attempt to locate Gemini installation
    const geminiSettingsPath = locateGeminiSettings();

    if (!geminiSettingsPath) {
      logToFile(
        "Gemini installation directory not found. Please install Gemini before running this setup.",
        true
      );
      process.exit(1);
    }

    const geminiDir = dirname(geminiSettingsPath);

    // Read existing settings.json if present
    let config = {};
    if (existsSync(geminiSettingsPath)) {
      logToFile(`Found existing Gemini settings at: ${geminiSettingsPath}`);
      try {
        config = JSON.parse(readFileSync(geminiSettingsPath, "utf8"));
      } catch (error) {
        logToFile(
          `Error reading existing settings: ${error.message}. Aborting to avoid data loss.`,
          true
        );
        process.exit(1);
      }
    } else {
      logToFile(
        `No existing Gemini settings found. A new one will be created at: ${geminiSettingsPath}`
      );
    }

    // Ensure mcpServers object exists
    if (!config.mcpServers || typeof config.mcpServers !== "object") {
      config.mcpServers = {};
    }

    // Derive npx path (same directory as node)
    const npxPath = join(dirname(nodePath), "npx");

    // Prompt user for setup choice
    const choice = await promptUser();

    if (choice === "1") {
      config = await setupLocal(config, nodePath);
    } else if (choice === "2") {
      config = await setupNpm(config, nodePath);
    } else {
      logToFile(`Invalid choice: ${choice}. Defaulting to local setup.`, true);
      config = await setupLocal(config, nodePath);
    }

    // Ensure desktop-commander is installed
    const desktopCommanderPackage = "@wonderwhy-er/desktop-commander";
    await ensurePackageInstalled(desktopCommanderPackage);

    // Always set / update desktop commander
    config.mcpServers.desktopCommander = {
      command: npxPath,
      args: [desktopCommanderPackage],
      env: {
        PATH: `${dirname(nodePath)}:${process.env.PATH}`,
        NODE_PATH: join(dirname(nodePath), "..", "lib", "node_modules"),
      },
    };

    // Ensure filesystem server is installed
    const filesystemPackage = "@modelcontextprotocol/server-filesystem";
    await ensurePackageInstalled(filesystemPackage);

    // Configure / update filesystem server
    config.mcpServers.filesystem = {
      command: npxPath,
      args: [
        "-y",
        filesystemPackage,
        join(homedir(), "Desktop"),
        join(homedir(), "Downloads"),
      ],
      env: {
        PATH: `${dirname(nodePath)}:${process.env.PATH}`,
        NODE_PATH: join(dirname(nodePath), "..", "lib", "node_modules"),
      },
    };

    // Write updated configuration back to settings.json
    writeFileSync(geminiSettingsPath, JSON.stringify(config, null, 2), "utf8");

    logToFile("Successfully updated Gemini MCP configuration!");
    logToFile(`Configuration location: ${geminiSettingsPath}`);
    logToFile(
      "\nTo use the MCP tools:\n1. Restart Gemini if it's currently running\n2. The tools will be available in Gemini's MCP server list"
    );
  } catch (error) {
    logToFile(`Error updating Gemini configuration: ${error}`, true);
    process.exit(1);
  }
})();
