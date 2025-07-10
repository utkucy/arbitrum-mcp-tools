# Arbitrum MCP Tools 🚀🦾

This project provides a set of tools for interacting with the Arbitrum blockchain via the Model Context Protocol (MCP), enabling AI assistants like Claude, Cursor, and Windsurf to perform blockchain operations.

## Table of Contents 📚

- [Setup Guide](#setup-guide)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Setup for Cursor](#setup-for-cursor)
  - [Setup for Claude](#setup-for-claude)
  - [Setup for Windsurf](#setup-for-windsurf)
  - [Setup for Gemini](#setup-for-gemini)
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

- Node.js v20.x or higher
- npm or yarn
- Git
- Alchemy API Key (sign up at https://www.alchemy.com/)
- Arbiscan API Key (sign up at https://arbiscan.io). This is optional but recommended for the `decodeTransactionCalldata` tool which uses it to fetch contract ABIs.

### Installation 🧑‍💻

1. Clone the repository:

```bash
git clone https://github.com/utkucy/arbitrum-mcp-tools.git
cd arbitrum-mcp-tools
```

2. Create a `.env` file in the project root with your API keys and configuration:

```bash
ALCHEMY_API_KEY=your_alchemy_api_key_here
ARBISCAN_API_KEY=your_arbiscan_api_key_here

# Stylus Contract Authentication (choose one method)
# Option 1: Direct private key (least secure, not recommended for production)
STYLUS_PRIVATE_KEY=your_private_key_here

# Option 2: Path to private key file (more secure)
STYLUS_PRIVATE_KEY_PATH=/path/to/your/private/key/file

# Option 3: Path to keystore file (most secure, requires password prompt)
STYLUS_KEYSTORE_PATH=/path/to/your/keystore/file
```

Replace the values with your actual API keys and authentication details:

- `ALCHEMY_API_KEY` is required for most tools to work correctly
- `ARBISCAN_API_KEY` is used by the `decodeTransactionCalldata` tool to fetch contract ABIs from Arbiscan; if not provided, this specific tool will return an error prompting you to set the key
- For Stylus tools (`deployStylusContract`, `deployMultipleStylusContracts`, `activateStylusContract`), you need to set **one** of the three authentication methods:
  - `STYLUS_PRIVATE_KEY`: Direct private key (quick but less secure)
  - `STYLUS_PRIVATE_KEY_PATH`: Path to a file containing your private key (more secure)
  - `STYLUS_KEYSTORE_PATH`: Path to an encrypted keystore file (most secure, will prompt for password)

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

   - Option 1: Setup Locally (It is recommended if you prefer to customize the tools and load them to LLMs.)
   - Option 2: Setup from NPM (install globally, recommended for general use.)

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

### Setup for Gemini 💫

1. Install the Gemini desktop application if you haven't already.

2. Run the setup script:

```bash
npm run setup-gemini
```

3. When prompted, choose your installation method:

   - **Option 1:** Setup Locally (recommended if you plan to customize the tools)
   - **Option 2:** Setup from NPM (install globally, recommended for general use)

4. The script will configure Gemini to use the Arbitrum MCP tools and will also install additional servers for desktop control and file-system access.

5. Restart Gemini to apply the changes.

> **Note**: The setup script will automatically use the Alchemy API key from your `.env` file to configure the MCP tools.

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

### Tool Documentation Links 🔗

For more detailed information on the underlying APIs and technologies used by these tools, please refer to the following resources:

- **Alchemy SDK**: [Alchemy SDK Quickstart](https://www.alchemy.com/docs/reference/alchemy-sdk-quickstart)
  - [SDK Core Methods](https://www.alchemy.com/docs/reference/sdk-core-methods)
  - [SDK NFT Methods](https://www.alchemy.com/docs/reference/sdk-nft-methods)
  - [SDK Transact Methods](https://www.alchemy.com/docs/reference/sdk-transact-methods)
- **Arbitrum Stylus**: [Stylus CLI Usage](https://docs.arbitrum.io/stylus/using-cli#using-cargo-stylus)

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

**Arbitrum MCP Tools uses an active registration pattern** – every tool is registered at runtime with `server.tool(...)`. To add a new tool you need to:

1. **Add the tool to its category’s `registerXTools` function**

```typescript
// src/tools/myCategory/index.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMyCategoryTools(server: McpServer) {
  server.tool(
    "myNewTool", // unique name
    "Short description of what it does", // description
    {
      param1: z.string().describe("Example parameter"),
    },
    async ({ param1 }) => {
      // TOOL LOGIC ⤵️
      return {
        content: [{ type: "text", text: `You sent ${param1}` }],
      };
    }
  );
}
```

2. **Hook the category into the global registry**

Add (or update) the import in `src/tools/index.ts` and call the register function inside `registerAllTools`:

```typescript
// src/tools/index.ts
import { registerMyCategoryTools } from "./myCategory/index.js";

export function registerAllTools(server: McpServer) {
  // …existing categories
  registerMyCategoryTools(server);
}
```

That’s it – when the MCP server starts, every `registerXTools` function runs and your new tool becomes available immediately.

---

### Testing Your Tools 🧪

1. Build the project after making changes:

```bash
npm run build
```

2. Test your tools by selecting the local setup option for the following commands:

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
