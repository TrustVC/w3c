## Starting the CLI local build

1. `npm run cli:install` - This installs all packages for the CLI app
2. `npm run cli:dev` - This listens to the w3c-cli src/ folder for any changes and rebuilds the files into the dist/ folder at the root level
3. `npm run cli:exec <command>` - This runs the CLI. Specify a command as parameter

The Electronic Bill of Lading (eBL) is a digital document that can be used to prove the ownership of goods. It is a standardised document that is accepted by all major shipping lines and customs authorities. The [Token Registry](https://github.com/Open-Attestation/token-registry) repository contains both the smart contract
code for token registry (in `/contracts`) as well as the node package for using this library (in `/src`).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [TradeTrustToken](#tradetrusttoken)
  - [Title Escrow](#title-escrow)
  - [Title Escrow Signable (Experimental)](#title-escrow-signable-experimental)
  - [Provider & Signer](#provider--signer)
  - [Roles and Access](#roles-and-access)
- [Deployment](#deployment)
  - [Quick Start](#quick-start)
  - [Advanced Usage](#advanced-usage)
    - [Token Contract](#token-contract)
      - [Stand-alone Contract](#stand-alone-contract)
      - [Using an existing Title Escrow Factory](#using-an-existing-title-escrow-factory)
    - [Title Escrow Factory](#title-escrow-factory)
      - [Deploy a new Title Escrow Factory](#deploy-a-new-title-escrow-factory)
  - [Verification](#verification)
  - [Network Configuration](#network-configuration)
- [Configuration](#configuration)
- [Development](#development)
  - [Scripts](#scripts)
- [Subgraph](#subgraph)
- [Notes](#notes)

## Installation

```sh
npm install --save @tradetrust-tt/token-registry
```

---

# Development

This repository's development framework uses

Tests are run using `npm run test`, more development tasks can be found in the package.json scripts.

### Scripts

```sh
npm install
npm test
npm run lint
npm run build

```

# Context Management

## Overview

This module manages context imports for DIDs (Decentralized Identifiers) and transferable records in the library. It provides URLs and JSON documents associated with various context types, which are used in verifiable credentials (VCs), DIDs, and transferable records.

## Imports

### JSON Context Files

- **DID Context (`did-v1.json`)**: Imports the DID v1 context as a JSON file.
- **Transferable Records Context (`transferable-records-context.json`)**: Imports the context for transferable records as a JSON file.
- **Document Type (`types.ts`)**: TypeScript type definition for a `Document` used throughout the code.

```typescript
import didV1 from './did-v1.json';
import trContext from './transferable-records-context.json';
import { Document } from './types';
```

## Constants

### URL Constants

- **DID_V1_URL**: URL to the W3C DID v1 context.
- **VC_V1_URL**: URL to the W3C Credentials v1 context.
- **VC_V2_URL**: URL to the W3C Credentials v2 context.
- **TR_CONTEXT_URL**: URL to the Transferable Records context hosted at trustvc.io.
- **BBS_V1_URL**: URL to the BBS (Blind Signature) security context.
- **STATUS_LIST_2021_CREDENTIAL_URL**: URL to the status list context for credentials from 2021.

```typescript
export const DID_V1_URL = 'https://www.w3.org/ns/did/v1';
export const VC_V1_URL = 'https://www.w3.org/2018/credentials/v1';
export const VC_V2_URL = 'https://www.w3.org/ns/credentials/v2';
export const TR_CONTEXT_URL = 'https://trustvc.io/context/transferable-records-context.json';
export const BBS_V1_URL = 'https://w3id.org/security/bbs/v1';
export const STATUS_LIST_2021_CREDENTIAL_URL = 'https://w3id.org/vc/status-list/2021/v1';
```

## Context Maps

The context mappings store the relationship between a context URL and the imported context JSON document. These are used to validate or issue verifiable credentials and transferable records.

- **contexts**: A map linking context URLs to their corresponding DID documents.
- **trContexts**: A map linking the transferable records context URL to its document.

```typescript
import { contexts, trContexts, CredentialContextVersion } from './contextManager';

// Access a DID context
const didContext = contexts[DID_V1_URL];

// Access a transferable records context
const trContext = trContexts[TR_CONTEXT_URL];

// Use a credential version context
const credentialV1 = CredentialContextVersion.v1;
const credentialV2 = CredentialContextVersion.v2;
```
