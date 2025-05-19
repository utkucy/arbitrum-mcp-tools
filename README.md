# Arbitrum MCP Tools 🚀🦾

This project provides a set of tools for interacting with the Arbitrum blockchain via the Model Context Protocol (MCP), enabling AI assistants like Claude, Cursor, and Windsurf to perform blockchain operations.

## Table of Contents 📚

- [Setup Guide](#setup-guide)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Setup for Cursor](#setup-for-cursor)
  - [Setup for Claude](#setup-for-claude)
  - [Setup for Windsurf](#setup-for-windsurf)
- [Usage](#usage)
  - [Available Tools](#available-tools)
  - [Example Usage](#example-usage)
- [Development Guide](#development-guide)
  - [Project Structure](#project-structure)
  - [Adding New Tools](#adding-new-tools)
  - [Tool Registration](#tool-registration)
  - [Testing Your Tools](#testing-your-tools)

## Setup Guide 🛠️

### Prerequisites 📝

- Node.js v16.x or higher
- npm or yarn
- Git
- Alchemy API Key (sign up at https://www.alchemy.com/)

### Installation 🧑‍💻

1. Clone the repository:

```bash
git clone https://github.com/utkucy/arbitrum-mcp-tools.git
cd arbitrum-mcp-tools
```

2. Create a `.env` file in the project root with your Alchemy API key:

```bash
echo "ALCHEMY_API_KEY=your_alchemy_api_key_here" > .env
```

Replace `your_alchemy_api_key_here` with your actual Alchemy API key. This step is required for the tools to work correctly.

3. Run one of the setup scripts as described in the sections below. The scripts will automatically install dependencies and build the project.

### Setup for Cursor 🖱️

1. Run the setup script:

```bash
npm run setup-cursor
```

2. When prompted, choose your installation method:

   - Option 1: Setup Locally (use current project files)
   - Option 2: Setup from NPM (install globally)

3. The script will configure Cursor to use the Arbitrum MCP tools.

4. Restart Cursor to apply the changes.

Note: The setup script will automatically use the Alchemy API key from your `.env` file to configure the MCP tools.

### Setup for Claude 🤖

1. Install Claude desktop application if you haven't already.

2. Run the setup script:

```bash
npm run setup-claude
```

3. When prompted, choose your installation method:

   - Option 1: Setup Locally (use current project files)
   - Option 2: Setup from NPM (install globally)

4. The script will configure Claude to use the Arbitrum MCP tools and additional servers for terminal and file system access.

5. Restart Claude to apply the changes.

Note: The setup script will automatically use the Alchemy API key from your `.env` file to configure the MCP tools.

### Setup for Windsurf 🌊🪁

1. Install Windsurf application if you haven't already.

2. Run the setup script:

```bash
npm run setup-windsurf
```

3. When prompted, choose your installation method:

   - Option 1: Setup Locally (use current project files)
   - Option 2: Setup from NPM (install globally)

4. The script will configure Windsurf to use the Arbitrum MCP tools.

5. Restart Windsurf to apply the changes.

Note: The setup script will automatically use the Alchemy API key from your `.env` file to configure the MCP tools.

## Usage 🎮

Once set up, the Arbitrum MCP tools will be available to your AI assistant. The tools are categorized by functionality and can be accessed through natural language.

### Available Tools 🧰

The tools are organized into several categories:

1. **Account Analysis** - Tools for checking balances, transactions, and tokens
2. **Chain Data** - Tools for retrieving blockchain data like blocks and transactions
3. **Contract Interaction** - Tools for interacting with smart contracts
4. **Cross-Chain** - Tools for cross-chain operations
5. **Development** - Tools for developers
6. **Batch Operations** - Tools for performing operations on multiple addresses
7. **Stylus** - Tools for Stylus development and interaction

### Example Usage 📝

When using Claude, Cursor, or Windsurf, you can simply ask for blockchain data using natural language. The AI will determine which tool to use.

Examples:

- "What's the ETH balance of 0x123...?"
- "Check NFTs owned by 0xabc..."
- "How much gas is needed to transfer 1 ETH?"
- "Show me the latest block on Arbitrum"
- "Decode this transaction input data: 0x..."

Each tool handles specific parameters. For example, to get an account balance:

```
Input: "What's the balance of 0x742d35Cc6634C0532925a3b844Bc454e4438f44e?"

The AI uses: getAccountBalance({ address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" })

Output: "The account has 1.23 ETH"
```

## Development Guide 🏗️

### Project Structure 🗂️

The codebase is organized into modular components:

```
src/
├── index.ts                # Main entry point
├── tools/                  # All tools organized by category
│   ├── common.ts           # Shared utilities and configs
│   ├── index.ts            # Tool registration
│   ├── accountAnalysis/    # Account analysis tools
│   ├── chainData/          # Chain data tools
│   ├── contractInteraction/# Contract interaction tools
│   ├── crossChain/         # Cross-chain tools
│   ├── development/        # Development tools
│   ├── batchOperations/    # Batch operation tools
│   └── stylus/             # Stylus development tools
```

### Adding New Tools 🛠️

1. Create a new file in the appropriate category folder or create a new category folder if needed.

2. Implement your tool following this template:

```typescript
import { AlchemyProvider } from "ethers";
import { getProvider } from "../common";

export async function myNewTool(params: { param1: string; param2: string }) {
  const { param1, param2 } = params;
  const provider = getProvider();

  // Your tool logic here

  return result;
}
```

### Tool Registration 🏷️

1. Register your tool in the category's index.ts file:

```typescript
// src/tools/myCategory/index.ts
export { myNewTool } from "./myNewTool";
```

2. Register the category in the main tools index file if it's a new category:

```typescript
// src/tools/index.ts
import * as myCategory from "./myCategory";

// Add your category to the exported tools
export const tools = {
  // ... existing categories
  myCategory,
};
```

3. Update the MCPServer configuration in `src/index.ts` if needed.

### Testing Your Tools 🧪

1. Build the project after making changes:

```bash
npm run build
```

2. Test your tools by selecting the local setup option:

```bash
npm run setup-cursor | setup-windsurf | setup-claude
```

3. If you're making significant changes, consider updating the setup scripts to ensure they handle your new tools correctly.

## Feature Matrix 🧮

For a detailed list of all available tools and their capabilities, see the [Feature Matrix](./FEATURES.md).

## Contributing 🙌

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📜

This project is licensed under the MIT License - see the LICENSE file for details.
