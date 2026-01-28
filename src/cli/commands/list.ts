import chalk from "chalk";
import { platforms, getPlatformIds } from "../clients/registry.js";
import { isPlatformDetected, isPlatformInstalled } from "../clients/base.js";
import { printHeader } from "../utils/ui.js";

export async function listCommand(): Promise<void> {
  printHeader("Arbitrum MCP Tools - Supported Platforms");

  console.log("");
  console.log(
    chalk.gray(
      "Platform                      │ Detected │ Global │ Local"
    )
  );
  console.log(
    chalk.gray(
      "─────────────────────────────────────────────────────────────"
    )
  );

  const platformIds = getPlatformIds();

  for (const platformId of platformIds) {
    const platform = platforms[platformId];
    const detected = isPlatformDetected(platformId);
    const globalInstalled = isPlatformInstalled(platformId, platform, "global");
    const localInstalled = isPlatformInstalled(platformId, platform, "local");

    const name = platform.name.padEnd(28);
    const detectedStr = detected
      ? chalk.green("✓")
      : chalk.gray("-");
    const globalStr = globalInstalled
      ? chalk.green("✓ installed")
      : chalk.gray("-");
    const localStr = localInstalled
      ? chalk.green("✓ installed")
      : chalk.gray("-");

    console.log(
      `${name} │ ${detectedStr.padEnd(18)} │ ${globalStr.padEnd(20)} │ ${localStr}`
    );
  }

  console.log("");
  console.log(chalk.gray("Legend:"));
  console.log(chalk.gray("  Detected: Platform app/folder found on system"));
  console.log(chalk.gray("  Global: Installed in user's home directory (all projects)"));
  console.log(chalk.gray("  Local: Installed in current directory (this project only)"));
  console.log("");
}
