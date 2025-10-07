# TrustVC W3C VC

This repository provides utilities for signing, verifying, and deriving Verifiable Credentials (VCs) using modern cryptographic signature schemes including ECDSA-SD-2023 and BBS-2023, with selective disclosure capabilities. These functions ensure the authenticity and integrity of VCs within a W3C-compliant ecosystem.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Supported Cryptosuites](#supported-cryptosuites)
- [Usage](#usage)
  - [1. Signing a Credential](#1-signing-a-credential)
  - [2. Verifying a Credential](#2-verifying-a-credential)
  - [3. Deriving a Credential (Selective Disclosure)](#3-deriving-a-credential-selective-disclosure)
  - [4. Schema Validation](#4-schema-validation)
- [Migration from Legacy BbsBlsSignature2020](#migration-from-legacy-bbsblssignature2020)
- [Best Practices](#best-practices)
- [License](#license)

## Installation
To install the package, use:

```sh
npm install @trustvc/w3c-vc
```

## Features
- **Modern Cryptosuites**: ECDSA-SD-2023 (default) and BBS-2023 with selective disclosure
- **W3C Compliance**: Support for both W3C VC Data Model v1.1 and v2.0
- **Selective Disclosure**: Derive credentials with selective field revelation
- **Legacy Support**: Deprecated BbsBlsSignature2020 signature support (verification only)
- **Schema Validation**: Checks if payload matches W3C VC schema
- **Version Detection**: Helper functions to detect credential versions

## Supported Cryptosuites

| Cryptosuite | Status | Signing | Verification | Derivation | Notes |
|-------------|--------|---------|--------------|------------|-------|
| `ecdsa-sd-2023` | ✅ Active (Default) | ✅ | ✅ | ✅ | Modern, fast, selective disclosure |
| `bbs-2023` | ✅ Active | ✅ | ✅ | ✅ | Modern BBS with selective disclosure |
| `BbsBlsSignature2020` | ⚠️ Deprecated | ❌ | ✅ | ❌ | Legacy support only |

## Usage

### 1. Signing a Credential

The `signCredential` function allows you to sign a Verifiable Credential using modern cryptographic signature schemes. **Default cryptosuite is `ecdsa-sd-2023`**.

#### ECDSA-SD-2023 Signing (Default)

```ts
import { signCredential } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - credential (RawVerifiableCredential): The credential to be signed.
 * - keyPair (PrivateKeyPair): The key pair options for signing.
 * - cryptoSuite (CryptoSuiteName, optional): The cryptosuite to be used. Defaults to "ecdsa-sd-2023".
 * - options (object, optional): Optional parameters including documentLoader and mandatoryPointers.
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - signedCredential.signed (SignedVerifiableCredential): The signed credential.
 *   - signedCredential.error (string): The error message in case of failure.
 */

const ecdsaKeyPair = {
  "id": "did:web:trustvc.github.io:did:1#multikey-1",
  "type": "Multikey",
  "controller": "did:web:trustvc.github.io:did:1",
  "secretKeyMultibase": "<secretKeyMultibase>",
  "publicKeyMultibase": "<publicKeyMultibase>"
};

const credential = {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/data-integrity/v2",
    "https://w3id.org/citizenship/v2"
  ],
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["Person"],
    "name": "TrustVC"
  },
  "validFrom": "2024-04-01T12:19:52Z",
  "validUntil": "2029-12-03T12:19:52Z",
  "issuer": "did:web:trustvc.github.io:did:1",
  "type": ["VerifiableCredential"]
};

// Sign with default ECDSA-SD-2023 cryptosuite
const signedCredential = await signCredential(credential, ecdsaKeyPair);

// Or explicitly specify cryptosuite with mandatory pointers
const signedCredentialWithOptions = await signCredential(credential, ecdsaKeyPair, 'ecdsa-sd-2023', {
  mandatoryPointers: ['/credentialSubject/name']
});

if (signedCredential.signed) {
  console.log('Signed Credential:', signedCredential.signed);
} else {
  console.error('Error:', signedCredential.error);
}
```

#### BBS-2023 Signing

```ts
import { signCredential } from '@trustvc/w3c-vc';

const bbsKeyPair = {
  "id": "did:web:trustvc.github.io:did:1#multikey-2",
  "type": "Multikey",
  "controller": "did:web:trustvc.github.io:did:1",
  "secretKeyMultibase": "<secretKeyMultibase>",
  "publicKeyMultibase": "<publicKeyMultibase>"
};

const credential = {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/data-integrity/v2",
    "https://w3id.org/citizenship/v2"
  ],
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["Person"],
    "name": "TrustVC"
  },
  "validFrom": "2024-04-01T12:19:52Z",
  "validUntil": "2029-12-03T12:19:52Z",
  "issuer": "did:web:trustvc.github.io:did:1",
  "type": ["VerifiableCredential"]
};

// Sign with BBS-2023 cryptosuite
const signedCredential = await signCredential(credential, bbsKeyPair, 'bbs-2023', {
  mandatoryPointers: ['/credentialSubject/name']
});

if (signedCredential.signed) {
  console.log('BBS-2023 Signed Credential:', signedCredential.signed);
} else {
  console.error('Error:', signedCredential.error);
}
```

#### Legacy BbsBlsSignature2020 Signing (Deprecated)

```ts
import { signCredential } from '@trustvc/w3c-vc';

// ⚠️ DEPRECATED: BbsBlsSignature2020 signing is no longer supported
const legacyResult = await signCredential(credential, keyPair, 'BbsBlsSignature2020');

// This will return an error:
// { error: "BbsBlsSignature2020 is no longer supported. Please use the latest cryptosuite versions instead." }
```

### 2. Verifying a Credential

The `verifyCredential` function allows you to verify signed Verifiable Credentials.

#### Modern Cryptosuite Verification (ECDSA-SD-2023 / BBS-2023)

> **Important**: For modern cryptosuites (ECDSA-SD-2023, BBS-2023), **base credentials must be derived before verification**. You cannot directly verify the original signed credential.

```ts
import { verifyCredential, deriveCredential } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - credential (SignedVerifiableCredential): The credential to be verified.
 * - options (object, optional): Optional parameters including documentLoader.
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - verificationResult.verified (boolean): Whether the verification was successful.
 *   - verificationResult.error (string): The error message if the verification failed.
 */

const signedCredential = {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://w3id.org/security/data-integrity/v2',
    "https://w3id.org/citizenship/v2"
  ],
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: ['Person'],
    name: 'TrustVC'
  },
  validFrom: '2024-04-01T12:19:52Z',
  validUntil: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
  proof: {
    type: 'DataIntegrityProof',
    cryptosuite: 'ecdsa-sd-2023',
    created: '2024-10-02T09:04:07Z',
    proofPurpose: 'assertionMethod',
    proofValue: 'z...',
    verificationMethod: 'did:web:trustvc.github.io:did:1#multikey-1'
  }
};

// ❌ This will fail - base credentials cannot be verified directly
const baseVerification = await verifyCredential(signedCredential);
// Returns: { verified: false, error: "ecdsa-sd-2023 base credentials must be derived before verification. Use deriveCredential() first." }

// ✅ Correct approach: Derive first, then verify
const derivedResult = await deriveCredential(signedCredential, ['/credentialSubject/name']);

if (derivedResult.derived) {
  const verificationResult = await verifyCredential(derivedResult.derived);
  
  if (verificationResult.verified) {
    console.log('Credential verified successfully.');
  } else {
    console.error('Verification failed:', verificationResult.error);
  }
}
```

#### Legacy BbsBlsSignature2020 Verification

```ts
import { verifyCredential } from '@trustvc/w3c-vc';

// Legacy BbsBlsSignature2020 credentials can be verified directly (both base and derived credentials)
const bbsCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/citizenship/v1'
  ],
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: ['Person'],
    name: 'TrustVC'
  },
  issuanceDate: '2024-04-01T12:19:52Z',
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: [ 'VerifiableCredential' ],
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-10-02T09:04:07Z',
    proofPurpose: 'assertionMethod',
    proofValue: 'A...',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1'
  }
};

const verificationResult = await verifyCredential(bbsCredential);

if (verificationResult.verified) {
  console.log('Legacy BbsBlsSignature2020 credential verified successfully.');
} else {
  console.error('Verification failed:', verificationResult.error);
}
```

### 3. Deriving a Credential (Selective Disclosure)

The `deriveCredential` function allows you to create selective disclosure from signed credentials.

#### ECDSA-SD-2023 Selective Disclosure

```ts
import { deriveCredential } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - credential (SignedVerifiableCredential): The verifiable credential to be selectively disclosed.
 * - revealedAttributes (string[]): Array of JSON pointers specifying which fields to reveal.
 * - options (object, optional): Optional parameters including documentLoader.
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - derived (SignedVerifiableCredential): The selectively disclosed credential.
 *   - error (string): The error message in case of failure.
 */

const signedCredential = {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://w3id.org/security/data-integrity/v2',
    "https://w3id.org/citizenship/v2"
  ],
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: ['Person'],
    name: 'TrustVC'
  },
  validFrom: '2024-04-01T12:19:52Z',
  validUntil: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
  proof: {
    type: 'DataIntegrityProof',
    cryptosuite: 'ecdsa-sd-2023',
    // ... proof details
  }
};

// Reveal only specific fields (mandatory pointers are automatically included)
const selectivePointers = ['/credentialSubject/name'];

const derivedResult = await deriveCredential(signedCredential, selectivePointers);

if (derivedResult.derived) {
  console.log('Derived ECDSA-SD-2023 Credential:', derivedResult.derived);
} else {
  console.error('Error:', derivedResult.error);
}

// ❌ Multiple derivation rounds are not supported
const secondDerivation = await deriveCredential(derivedResult.derived, selectivePointers);
// Returns: { error: "ecdsa-sd-2023 derived credentials cannot be further derived. Multiple rounds of derivation are not supported by this cryptosuite." }
```

#### BBS-2023 Selective Disclosure

```ts
import { deriveCredential } from '@trustvc/w3c-vc';

const bbsSignedCredential = {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://w3id.org/security/data-integrity/v2',
    "https://w3id.org/citizenship/v2"
  ],
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: ['Person'],
    name: 'TrustVC'
  },
  validFrom: '2024-04-01T12:19:52Z',
  validUntil: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
  proof: {
    type: 'DataIntegrityProof',
    cryptosuite: 'bbs-2023',
    // ... proof details
  }
};

// Reveal only specific fields (mandatory pointers are automatically included)
const selectivePointers = ['/credentialSubject/name'];

const derivedResult = await deriveCredential(bbsSignedCredential, selectivePointers);

if (derivedResult.derived) {
  console.log('Derived BBS-2023 Credential:', derivedResult.derived);
} else {
  console.error('Error:', derivedResult.error);
}
```

#### Legacy BbsBlsSignature2020 Derivation (Deprecated)

```ts
import { deriveCredential } from '@trustvc/w3c-vc';

// ⚠️ DEPRECATED: BbsBlsSignature2020 derivation is no longer supported
const legacyDerivation = await deriveCredential(credential, revealedAttributes);

// This will return an error:
// { error: "BbsBlsSignature2020 is no longer supported for derivation. Please use the latest cryptosuite versions instead." }
```

### 4. Schema Validation

Validate if a document meets W3C VC schema requirements:

```ts
import { 
  isRawDocument, 
  isSignedDocument,
  isRawDocumentV1_1,
  isRawDocumentV2_0,
  isSignedDocumentV1_1,
  isSignedDocumentV2_0,
  isDerived
} from '@trustvc/w3c-vc';

/**
 * Available validation functions:
 * - isRawDocument(document): Checks if document is a valid raw credential
 * - isSignedDocument(document): Checks if document is a valid signed credential
 * - isRawDocumentV1_1(document): Checks if document is a valid v1.1 raw credential
 * - isRawDocumentV2_0(document): Checks if document is a valid v2.0 raw credential
 * - isSignedDocumentV1_1(document): Checks if document is a valid v1.1 signed credential
 * - isSignedDocumentV2_0(document): Checks if document is a valid v2.0 signed credential
 * - isDerived(document): Checks if document is a derived (selective disclosure) credential
 */

const document = {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/data-integrity/v2",
    "https://w3id.org/citizenship/v2"
  ],
  "type": ["VerifiableCredential"],
  "issuer": "did:web:example.com",
  "validFrom": "2024-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:123",
    "type": ["Person"],
    "name": "John Doe"
  }
};

// Basic validation
console.log('Is raw document:', isRawDocument(document)); // true
console.log('Is signed document:', isSignedDocument(document)); // false (no proof)

// Version-specific validation
console.log('Is v1.1 raw document:', isRawDocumentV1_1(document)); // false
console.log('Is v2.0 raw document:', isRawDocumentV2_0(document)); // true

// Check if credential is derived (selective disclosure)
const signedDocument = { ...document, proof: { /* proof object */ } };
console.log('Is derived credential:', await isDerived(signedDocument));
```

## Migration from Legacy BbsBlsSignature2020

If you're migrating from legacy BbsBlsSignature2020 signatures:

1. **Update Key Pairs**: Use Multikey format instead of Bls12381G2Key2020
2. **Change Cryptosuite**: Use 'ecdsa-sd-2023' or 'bbs-2023' instead of 'BbsBlsSignature2020'
3. **Update Contexts**: Use W3C VC Data Model v2.0 contexts
4. **Modify Derivation**: Use JSON pointer arrays instead of ContextDocument format
5. **Update Verification Flow**: Derive credentials before verification for modern cryptosuites

```ts
// Legacy BbsBlsSignature2020 (deprecated)
const legacyKeyPair = {
  type: "Bls12381G2Key2020",
  privateKeyBase58: "...",
  publicKeyBase58: "..."
};

// Modern approach
const modernKeyPair = {
  type: "Multikey",
  secretKeyMultibase: "...",
  publicKeyMultibase: "..."
};
```

## Best Practices

1. **Use Modern Cryptosuites**: Prefer 'ecdsa-sd-2023' (default) or 'bbs-2023' over legacy BbsBlsSignature2020
2. **Implement Proper Error Handling**: Always check for errors in function results
3. **Derive Before Verify**: For modern cryptosuites, always derive credentials before verification
4. **Use Mandatory Pointers**: Specify fields that should always be revealed in selective disclosure
5. **Version Detection**: Use helper functions to detect credential versions when needed
6. **Single Derivation**: Remember that modern cryptosuites support only single-round derivation

## License

This project is licensed under the Apache 2.0 License.
