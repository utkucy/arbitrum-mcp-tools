import { checkbox, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { platforms, getPlatformIds } from "../clients/registry.js";
import {
  isPlatformInstalled,
  uninstallFromPlatform,
  Scope,
} from "../clients/base.js";
import {
  printHeader,
  printSuccess,
  printError,
  printUninstallComplete,
} from "../utils/ui.js";

interface PlatformChoice {
  name: string;
  value: string;
  disabled: boolean | string;
  checked: boolean;
}

export async function uninstallCommand(): Promise<void> {
  printHeader("Arbitrum MCP Tools - Uninstall Wizard");

  const platformIds = getPlatformIds();

  // Find platforms that have arbitrum installed
  const installedPlatforms: { id: string; scope: Scope }[] = [];

  for (const id of platformIds) {
    const platform = platforms[id];
    if (isPlatformInstalled(id, platform, "global")) {
      installedPlatforms.push({ id, scope: "global" });
    }
    if (isPlatformInstalled(id, platform, "local")) {
      installedPlatforms.push({ id, scope: "local" });
    }
  }

  if (installedPlatforms.length === 0) {
    console.log(chalk.yellow("\nNo installations found. Nothing to uninstall."));
    return;
  }

  // Build choices
  const choices: PlatformChoice[] = installedPlatforms.map(({ id, scope }) => {
    const platform = platforms[id];
    const scopeLabel = scope === "global" ? "global" : "local";

    return {
      name: `${platform.name} (${scopeLabel})`,
      value: `${id}:${scope}`,
      disabled: false,
      checked: true,
    };
  });

  console.log("");

  // Platform selection
  const selectedItems = await checkbox({
    message: "Which installations do you want to remove? (Space to select, Enter to confirm)",
    choices: [
      {
        name: chalk.bold("Select All"),
        value: "__all__",
        checked: false,
        disabled: false,
      },
      ...choices,
    ],
    pageSize: 10,
  });

  // Handle "All" selection
  let finalSelection: string[];
  if (selectedItems.includes("__all__")) {
    finalSelection = installedPlatforms.map(({ id, scope }) => `${id}:${scope}`);
  } else {
    finalSelection = selectedItems.filter((p) => p !== "__all__");
  }

  if (finalSelection.length === 0) {
    console.log(chalk.yellow("\nNo platforms selected. Uninstall cancelled."));
    return;
  }

  // Confirm uninstall
  const proceed = await confirm({
    message: `Remove from ${finalSelection.length} installation(s)?`,
    default: false,
  });

  if (!proceed) {
    console.log(chalk.yellow("\nUninstall cancelled."));
    return;
  }

  console.log("");

  // Perform uninstalls
  let successCount = 0;
  let failCount = 0;

  for (const item of finalSelection) {
    const [platformId, scope] = item.split(":") as [string, Scope];
    const platform = platforms[platformId];
    const result = uninstallFromPlatform(platformId, platform, scope);

    const scopeLabel = scope === "global" ? "global" : "local";

    if (result.success) {
      printSuccess(`${platform.name} (${scopeLabel}) config updated`);
      successCount++;
    } else {
      printError(`${platform.name} (${scopeLabel}): ${result.error || "Failed to update config"}`);
      failCount++;
    }
  }

  console.log("");

  if (successCount > 0) {
    printUninstallComplete();
  } else {
    console.log(chalk.red("Uninstall failed. No configurations were modified."));
  }
}
