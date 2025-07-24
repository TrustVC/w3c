# TrustVC W3C Context

A comprehensive package that caches commonly used JSON-LD context schemas for W3C Verifiable Credentials and Data Integrity proofs. This package provides a document loader that resolves context URLs locally, improving performance and reliability for verifiable credential operations.

## Features

- **Local Context Caching**: Pre-cached JSON-LD contexts for faster resolution
- **W3C Standards Support**: Full support for W3C Verifiable Credentials and Data Integrity specifications
- **Cryptosuite Support**: Includes contexts for multiple cryptographic suites:
  - BBS+ signatures (bbs-v1)
  - JWS 2020 (jws-2020)
  - BLS12-381 keys
- **DID Resolution**: Built-in support for DID document resolution
- **Custom Context Support**: Ability to add additional contexts at runtime
- **TypeScript Support**: Full TypeScript definitions included

## Installation

```sh
npm install @trustvc/w3c-context
```

## Usage

### Basic Document Loader

```typescript
import { getDocumentLoader } from '@trustvc/w3c-context';

// Get a document loader with all cached contexts
const documentLoader = await getDocumentLoader();

// Use with jsonld-signatures or other JSON-LD libraries
const result = await documentLoader('https://w3id.org/security/data-integrity/v2');
```

### With Additional Contexts

```typescript
import { getDocumentLoader } from '@trustvc/w3c-context';

// Add custom contexts
const additionalContexts = {
  'https://example.com/my-context': {
    "@context": {
      "MyProperty": "https://example.com/vocab#MyProperty"
    }
  }
};

const documentLoader = await getDocumentLoader(additionalContexts);
```

### Available Context URLs

The package includes the following pre-cached contexts:

#### Core W3C Contexts
- `https://w3id.org/security/data-integrity/v2` - Data Integrity v2
- `https://www.w3.org/ns/did/v1` - DID Core v1
- `https://www.w3.org/2018/credentials/v1` - Verifiable Credentials v1
- `https://www.w3.org/ns/credentials/v2` - Verifiable Credentials v2
- `https://w3id.org/vc/status-list/2021/v1` - Status List 2021 v1

#### Cryptographic Suite Contexts
- `https://w3id.org/security/bbs/v1` - BBS+ v1
- `https://w3id.org/security/suites/bls12381-2020/v1` - BLS12-381 2020
- `https://w3id.org/security/suites/jws-2020/v1` - JWS 2020

#### TrustVC Business Contexts
- `https://trustvc.io/context/transferable-records-context.json` - Transferable Records
- `https://trustvc.io/context/render-method-context.json` - Render Methods
- `https://trustvc.io/context/attachments-context.json` - Attachments
- `https://trustvc.io/context/qrcode-context.json` - QR Code
- `https://trustvc.io/context/bill-of-lading.json` - Bill of Lading
- `https://trustvc.io/context/bill-of-lading-carrier.json` - Bill of Lading Carrier
- `https://trustvc.io/context/coo.json` - Certificate of Origin
- `https://trustvc.io/context/invoice.json` - Invoice
- `https://trustvc.io/context/promissory-note.json` - Promissory Note
- `https://trustvc.io/context/warehouse-receipt.json` - Warehouse Receipt

### Context Constants

You can import URL constants for type safety:

```typescript
import { 
  DATA_INTEGRITY_V2_URL,
  MULTIKEY_V1_URL,
  VC_V1_URL
} from '@trustvc/w3c-context';

console.log(DATA_INTEGRITY_V2_URL); // https://w3id.org/security/data-integrity/v2
console.log(MULTIKEY_V1_URL); // https://w3id.org/security/multikey/v1
```

### Using Modern Cryptosuites

For BBS-2023 and ECDSA-SD-2023, use the Data Integrity context:

```typescript
import { DATA_INTEGRITY_V2_URL, VC_V1_URL } from '@trustvc/w3c-context';

// Create a credential with BBS-2023 or ECDSA-SD-2023
const credential = {
  "@context": [
    VC_V1_URL,
    DATA_INTEGRITY_V2_URL  // Supports BBS-2023, ECDSA-SD-2023
  ],
  "type": ["VerifiableCredential"],
  "credentialSubject": {
    // ... credential data
  },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "bbs-2023", // or "ecdsa-sd-2023"
    // ... proof data
  }
};
```

### DID Resolution

The document loader automatically resolves DID URLs:

```typescript
const documentLoader = await getDocumentLoader();

// Resolves DID document
const didDoc = await documentLoader('did:web:example.com');

// Resolves specific verification method
const verificationMethod = await documentLoader('did:web:example.com#key-1');
```

## API Reference

### `getDocumentLoader(additionalContexts?)`

Creates a document loader function that resolves JSON-LD contexts.

**Parameters:**
- `additionalContexts` (optional): Record<string, Document> - Additional contexts to include

**Returns:** Promise<DocumentLoader> - A document loader function

### Context Categories

The package organizes contexts into several categories:

- `contexts` - Core W3C and cryptographic contexts
- `trContexts` - Transferable records contexts
- `renderContexts` - Rendering method contexts
- `attachmentsContexts` - Attachment contexts
- `qrCodeContexts` - QR code contexts
- `templateContexts` - Business document templates

## Development

```sh
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.
