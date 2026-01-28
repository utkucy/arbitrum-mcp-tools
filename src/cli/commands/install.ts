import { checkbox, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { platforms, getPlatformIds } from "../clients/registry.js";
import {
  isPlatformDetected,
  isPlatformInstalled,
  installToPlatform,
  Scope,
} from "../clients/base.js";
import {
  printHeader,
  printSuccess,
  printError,
  printApiKeyInstructions,
} from "../utils/ui.js";

export async function installCommand(): Promise<void> {
  printHeader("Arbitrum MCP Tools - Installation Wizard");

  const platformIds = getPlatformIds();

  // Build choices with detection status (nothing pre-checked)
  const choices = platformIds.map((id) => {
    const platform = platforms[id];
    const detected = isPlatformDetected(id);
    const globalInstalled = isPlatformInstalled(id, platform, "global");
    const localInstalled = isPlatformInstalled(id, platform, "local");

    let status = "";
    if (globalInstalled || localInstalled) {
      status = chalk.yellow(" (already installed)");
    } else if (detected) {
      status = chalk.green(" ✓ detected");
    }

    return {
      name: `${platform.name}${status}`,
      value: id,
    };
  });

  console.log("");

  // Platform selection (no pre-checked items)
  const selectedPlatforms = await checkbox({
    message: "Which platforms do you want to install to? (Space to select, Enter to confirm)",
    choices,
    pageSize: 10,
    required: true,
  });

  if (selectedPlatforms.length === 0) {
    console.log(chalk.yellow("\nNo platforms selected. Installation cancelled."));
    return;
  }

  // Scope selection
  const scope = await select<Scope>({
    message: "Installation scope:",
    choices: [
      {
        name: "Global (All projects - recommended)",
        value: "global",
        description: "Install to your home directory, available in all projects",
      },
      {
        name: "Local (Current directory only)",
        value: "local",
        description: "Install to .{platform}/ in current directory",
      },
    ],
    default: "global",
  });

  // Show what will be installed
  console.log("");
  console.log(chalk.cyan("Selected platforms:"));
  for (const platformId of selectedPlatforms) {
    const platform = platforms[platformId];
    console.log(chalk.gray(`  • ${platform.name}`));
  }
  console.log("");

  // Confirm installation
  const proceed = await confirm({
    message: `Install to ${selectedPlatforms.length} platform(s) (${scope})?`,
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("\nInstallation cancelled."));
    return;
  }

  console.log("");

  // Perform installations
  let successCount = 0;

  for (const platformId of selectedPlatforms) {
    const platform = platforms[platformId];
    const result = installToPlatform(platformId, platform, scope);

    if (result.success) {
      printSuccess(`${platform.name} config updated`);
      successCount++;
    } else {
      printError(`${platform.name}: ${result.error || "Failed to update config"}`);
    }
  }

  console.log("");

  if (successCount > 0) {
    printApiKeyInstructions();
  } else {
    console.log(chalk.red("Installation failed. No platforms were configured."));
  }
}
