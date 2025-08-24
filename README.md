# Asset Tokenization Platform - 2025 Midnight Hackathon

## Project Overview

This project is a decentralized asset tokenization platform built on the Midnight Network, enabling real-world assets to be represented as privacy-preserving digital shares. The platform leverages shielded transactions to ensure complete anonymity while maintaining transparent trade integrity through verifiable on-chain proofs.

## Track Focus

### Freedom of Commerce

This smart contract embodies freedom of commerce by allowing anyone to tokenize real-world assets and trade them directly on a decentralized network. By removing traditional financial intermediaries, it creates a permissionless, peer-to-peer marketplace, lowering barriers and increasing access for all participants.

Asset tokenization is the process by which an issuer creates digital tokens on a blockchain or other form of distributed ledger to represent digital or physical assets. Blockchain technology guarantees that once you buy tokens representing an asset, no single authority can erase or change your ownership, making it entirely immutable.

## How It Works

### Core Functionality

1. **Asset Tokenization**: Real-world assets are tokenized into shares that are represented as shielded native tokens
2. **Privacy-First Design**: All transactions are shielded, ensuring anonymity while maintaining verifiable integrity
3. **Secure Ownership**: Shares provide true ownership with complete privacy protection
4. **Decentralized Trading**: Direct peer-to-peer trading without intermediaries

### Contract Workflow

1. **Asset Setup**: The contract owner sets asset details, unit price, and total shares quantity
2. **Share Minting**: Users can mint shares by paying the requested price into the contract
3. **Offer Creation**: Owners can sell shares by creating offers, locking their shares into the contract
4. **Privacy Protection**: A nullifier mechanism ensures seller privacy at all times
5. **Secure Trading**: The integrity of trades is publicly verifiable on the ledger, but transaction details remain encrypted

### Key Components

#### OpenZeppelin Integration

The contract integrates OpenZeppelin's Ownable library to ensure that critical administrative functions are restricted to the contract owner, providing a foundational layer of security.

#### Shielded Token Technology

A shielded token enables transactions without exposing wallet addresses or transaction details, protecting user privacy and preventing metadata leakage.

#### Secure Data Sharing

The integrity of trades is publicly verifiable on the ledger, but the details of who is buying or selling, and for what price, remain encrypted and private, guaranteeing commercial confidentiality for all participants.

## Architecture

This project is organized as a Turborepo monorepo with the following structure:

### Applications (`/apps`)

- **`cli/`** - Command-line interface for contract interaction
- **`ui/`** - React-based web interface (built with Vite + TypeScript)

### Packages (`/packages`)

- **`contract/`** - Core smart contract implementation
- **`api/`** - Reusable API for contract interaction (publishable to npm)
- **`eslint-config/`** - Shared ESLint configurations
- **`typescript-config/`** - Shared TypeScript configurations

## Current Status & Disclaimers

### ⚠️ Important Disclaimers

- **UI Integration**: The UI is not fully integrated as the contract underwent last-minute changes due to Midnight Network token handling issues (send/receiving tokens in a specific manner)
- **CLI Functionality**: The CLI is fully functional and allows complete interaction with the contract
- **Developer Tools**: Due to our code organization, the API package is publishable to npm and enables other developers to interact with the contract seamlessly
- **Build System**: We utilized Turbo for efficient monorepo management and build orchestration

## Technology Stack

- **Smart Contracts**: Compact (with OpenZeppelin libraries)
- **Frontend**: React + TypeScript + Vite
- **Build System**: Turborepo
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9.0.0+
- Run a Proof Server:

```sh
docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'
```

### Installation

```bash
# Clone the repository
git clone
cd 2025-hackathon-midnight

# Install dependencies
pnpm install

# Build all packages
pnpm turbo build
```

### Using the UI

Run the UI

```bash
# Start the UI
pnpm --filter ui start

```

### Using the CLI

The CLI provides full functionality to interact with the tokenization contract:

```bash
pnpm --filter example-cli testnet-remote

# We believe the CLI itself is intuitive enough that you can interact with it.
# It might ask you for a couple of things that you need to input and you will see your tokens in your wallet.
```

### Using the API Package

The API package can be published to npm and used by other developers. We've made the following packages:

- `contract-api`: under `packages/api` we have a layer of abstraction (based on the official `example-bboard`) that is organizaed in such a way that is easily publishable and therefore any developer could interact with the contract.
- `contract-primitives`: under `packages/contract` we have the autogenerated typescript code that has all the types used by the contract and the contract code itself. That can also be published.

We strongly believe doing these sort of packages empower developers to create their own interfaces to the smart contracts.
A good example for it is a registry of the contracts available and their public status that could be fetched with these packages. They expose the types for you already!

## Privacy & Security Features

- **Shielded Transactions**: All token transfers are privacy-preserving
- **Nullifier Protection**: Seller identity protection through cryptographic nullifiers
- **Verifiable Integrity**: Trade validity is publicly verifiable without revealing details
- **Access Control**: OpenZeppelin Ownable pattern for administrative functions

## Hackathon Achievement

This project successfully demonstrates:

- Real-world asset tokenization on a privacy-focused blockchain
- Integration of OpenZeppelin security patterns
- Freedom of commerce through decentralized, permissionless trading
- Privacy-preserving financial transactions
- Developer-friendly tools and APIs

## Credits

We heavily used the `example-bboard` use case that solved a lot of our key problems. Thanks for that example! ❤️

## Made with ❤️ by "Gracias Esteban"

The team is made up by:

- Agustín Osiecki
- Nicolás Ludueña
- Emmanuel Gunther
- Sofía Bobbiesi
