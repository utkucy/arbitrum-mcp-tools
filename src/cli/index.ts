#!/usr/bin/env node

import chalk from "chalk";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { listCommand } from "./commands/list.js";

const VERSION = "2.0.0";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "install":
      await installCommand();
      break;

    case "uninstall":
      await uninstallCommand();
      break;

    case "list":
      await listCommand();
      break;

    case "--version":
    case "-v":
      console.log(`arbitrum-mcp-tools v${VERSION}`);
      break;

    case "--help":
    case "-h":
    case undefined:
      printHelp();
      break;

    default:
      console.log(chalk.red(`Unknown command: ${command}`));
      console.log("");
      printHelp();
      process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
${chalk.cyan.bold("Arbitrum MCP Tools")} - Universal MCP Server Installer

${chalk.yellow("Usage:")}
  npx arbitrum-mcp-tools ${chalk.green("<command>")}

${chalk.yellow("Commands:")}
  ${chalk.green("install")}     Interactive installation wizard
  ${chalk.green("uninstall")}   Interactive uninstall wizard
  ${chalk.green("list")}        Show supported platforms and installation status

${chalk.yellow("Options:")}
  ${chalk.green("--version, -v")}   Show version number
  ${chalk.green("--help, -h")}      Show this help message

${chalk.yellow("Examples:")}
  npx arbitrum-mcp-tools install     # Start interactive installation
  npx arbitrum-mcp-tools uninstall   # Start interactive uninstall
  npx arbitrum-mcp-tools list        # Show platform status

${chalk.yellow("Supported Platforms:")}
  • Claude Desktop / Claude Code
  • Cursor
  • Windsurf
  • VS Code
  • Gemini CLI
  • OpenAI Codex

${chalk.gray("For more information, visit:")}
${chalk.blue("https://github.com/utkucy/arbitrum-mcp-tools")}
`);
}

main().catch((error) => {
  console.error(chalk.red("Error:"), error.message);
  process.exit(1);
});
