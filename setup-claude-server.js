import { homedir, platform } from "os";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createInterface } from "readline";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine OS and set appropriate config path and command
const isWindows = platform() === "win32";
const claudeConfigPath = isWindows
  ? join(process.env.APPDATA, "Claude", "claude_desktop_config.json")
  : join(
      homedir(),
      "Library",
      "Application Support",
      "Claude",
      "claude_desktop_config.json"
    );

// Setup logging
const LOG_FILE = join(__dirname, "setup.log");

function logToFile(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${isError ? "ERROR: " : ""}${message}\n`;
  try {
    appendFileSync(LOG_FILE, logMessage);
    // For setup script, we'll still output to console but in JSON format
    const jsonOutput = {
      type: isError ? "error" : "info",
      timestamp,
      message,
    };
    process.stdout.write(JSON.stringify(jsonOutput) + "\n");
  } catch (err) {
    // Last resort error handling
    process.stderr.write(
      JSON.stringify({
        type: "error",
        timestamp: new Date().toISOString(),
        message: `Failed to write to log file: ${err.message}`,
      }) + "\n"
    );
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
  // Use the local project path for the index.js file
  const packagePath = join(__dirname, "build", "src", "index.js");
  logToFile(`Using local project path: ${packagePath}`);

  // Configure the Arbitrum MCP tools server
  config.mcpServers.arbitrumMCPTools = {
    command: nodePath,
    args: [packagePath],
    env: {
      PATH: `${dirname(nodePath)}:${process.env.PATH}`,
      NODE_PATH: join(dirname(nodePath), "..", "lib", "node_modules"),
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
  config.mcpServers.arbitrumMCPTools = {
    command: nodePath,
    args: [packagePath],
    env: {
      PATH: `${dirname(nodePath)}:${process.env.PATH}`,
      NODE_PATH: join(dirname(nodePath), "..", "lib", "node_modules"),
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

// Check if config file exists and create default if not
if (!existsSync(claudeConfigPath)) {
  logToFile(`Claude config file not found at: ${claudeConfigPath}`);
  logToFile("Creating default config file...");

  // Create the directory if it doesn't exist
  const configDir = dirname(claudeConfigPath);
  if (!existsSync(configDir)) {
    import("fs").then((fs) => fs.mkdirSync(configDir, { recursive: true }));
  }

  // Create default config
  const defaultConfig = {
    serverConfig: isWindows
      ? {
          command: "cmd.exe",
          args: ["/c"],
        }
      : {
          command: "/bin/sh",
          args: ["-c"],
        },
  };

  writeFileSync(claudeConfigPath, JSON.stringify(defaultConfig, null, 2));
  logToFile(
    "Default config file created. Please update it with your Claude API credentials."
  );
}

(async function main() {
  try {
    // Read existing config
    const configData = readFileSync(claudeConfigPath, "utf8");
    const config = JSON.parse(configData);

    // Get node path using process
    const nodePath = process.execPath;
    // Get npx path - it's in the same directory as node
    const npxPath = join(dirname(nodePath), "npx");

    // Initialize mcpServers if it doesn't exist
    if (!config.mcpServers) {
      config.mcpServers = {};
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

    // Ensure desktop-commander is installed
    const desktopCommanderPackage = "@wonderwhy-er/desktop-commander";
    await ensurePackageInstalled(desktopCommanderPackage);

    // Check if desktop-commander is already configured
    const desktopCommanderAlreadyInstalled =
      config.mcpServers && config.mcpServers.desktopCommander;

    // Add desktop-commander for terminal access
    if (!desktopCommanderAlreadyInstalled) {
      logToFile("Adding desktop-commander to Claude configuration...");
    }

    // Configure the Desktop Commander server (always add to ensure configuration is up to date)
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

    // Check if filesystem is already configured
    const filesystemAlreadyInstalled =
      config.mcpServers && config.mcpServers.filesystem;

    // Add filesystem server
    if (!filesystemAlreadyInstalled) {
      logToFile("Adding filesystem server to Claude configuration...");
    }

    // Configure the Filesystem server (always add to ensure configuration is up to date)
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

    // Write the updated config back
    writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2), "utf8");

    logToFile("Successfully updated Claude configuration!");
    logToFile(`Configuration location: ${claudeConfigPath}`);
    logToFile(
      "\nTo use the MCP tools:\n1. Restart Claude if it's currently running\n2. The tools will be available in Claude's MCP server list"
    );
  } catch (error) {
    logToFile(`Error updating Claude configuration: ${error}`, true);
    process.exit(1);
  }
})();
