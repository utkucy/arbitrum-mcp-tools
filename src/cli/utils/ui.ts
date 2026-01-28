import chalk from "chalk";
import boxen from "boxen";
import os from "os";

export function printHeader(title: string): void {
  console.log(
    boxen(chalk.bold.cyan(title), {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: "round",
      borderColor: "cyan",
    })
  );
}

export function printSuccess(message: string): void {
  console.log(chalk.green("✓") + " " + message);
}

export function printError(message: string): void {
  console.log(chalk.red("✗") + " " + message);
}

export function printWarning(message: string): void {
  console.log(chalk.yellow("⚠") + " " + message);
}

export function printInfo(message: string): void {
  console.log(chalk.blue("ℹ") + " " + message);
}

export function printCompletionBox(lines: string[]): void {
  const content = lines.join("\n");
  console.log(
    boxen(content, {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: "round",
      borderColor: "green",
    })
  );
}

function getApiKeyInstructionsForPlatform(): string[] {
  const platform = os.platform();

  if (platform === "win32") {
    // Windows instructions
    return [
      chalk.green.bold("✓ Installation complete!"),
      "",
      chalk.yellow("⚠  IMPORTANT: Set up your API keys:"),
      "",
      chalk.gray("Option 1: Set environment variables permanently (PowerShell Admin):"),
      chalk.white('[System.Environment]::SetEnvironmentVariable("ALCHEMY_API_KEY", "your-key", "User")'),
      chalk.white('[System.Environment]::SetEnvironmentVariable("ARBISCAN_API_KEY", "your-key", "User")'),
      "",
      chalk.gray("Option 2: Set for current session (PowerShell):"),
      chalk.white('$env:ALCHEMY_API_KEY = "your-key-here"'),
      chalk.white('$env:ARBISCAN_API_KEY = "your-key-here"'),
      "",
      chalk.gray("Option 3: Set via System Properties > Environment Variables"),
      "",
      chalk.cyan("Restart your editors to apply changes."),
    ];
  } else {
    // macOS/Linux instructions
    const shellConfig = platform === "darwin" ? "~/.zshrc" : "~/.bashrc";
    return [
      chalk.green.bold("✓ Installation complete!"),
      "",
      chalk.yellow("⚠  IMPORTANT: Set up your API keys:"),
      "",
      chalk.gray(`# Add to ${shellConfig}:`),
      chalk.white('export ALCHEMY_API_KEY="your-key-here"'),
      chalk.white('export ARBISCAN_API_KEY="your-key-here"'),
      "",
      chalk.gray("Then restart your terminal or run:"),
      chalk.white(`source ${shellConfig}`),
      "",
      chalk.cyan("Restart your editors to apply changes."),
    ];
  }
}

export function printApiKeyInstructions(): void {
  const instructions = getApiKeyInstructionsForPlatform();
  printCompletionBox(instructions);
}

export function printUninstallComplete(): void {
  const content = chalk.green.bold("✓ Uninstall complete!");
  console.log(
    boxen(content, {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: "round",
      borderColor: "green",
    })
  );
}
