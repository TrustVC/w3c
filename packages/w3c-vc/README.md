# TrustVC W3C VC

This repository provides utilities for signing and verifying Verifiable Credentials (VCs) using multiple signature schemes including BBS+ and ECDSA-SD-2023. These functions can be used to ensure the authenticity and integrity of VCs within a W3C-compliant ecosystem.

## Installation
To install the package, use:

```sh
npm install @trustvc/w3c-vc
```

## Feature
- Sign and Verify for BBS+ signature for W3C VC
- Sign and Verify for ECDSA-SD-2023 signature for W3C VC with selective disclosure
- Derive a new VC with selective disclosure using BBS+ signature
- Derive a new VC with selective disclosure using ECDSA-SD-2023 signature
- Checks if payload matches W3C VC schema

## Usage
### 1. Signing a Credential

The signCredential function allows you to sign a Verifiable Credential using either BBS+ or ECDSA-SD-2023 signature schemes.

#### BBS+ Signing (Default)

```ts
import { signCredential } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - credential (RawVerifiableCredential): The credential to be signed.
 * - keyPair (PrivateKeyPair): The key pair options for signing.
 * - cryptoSuite (string, optional): The cryptosuite to be used for signing. Defaults to "BbsBlsSignature2020".
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - signedCredential.signed (SignedVerifiableCredential): The signed credential.
 *   - signedCredential.error (string): The error message in case of failure.
 */

const keyPair = {
  "id": "did:web:trustvc.github.io:did:1#keys-1",
  "type": "Bls12381G2Key2020",
  "controller": "did:web:trustvc.github.io:did:1",
  "seedBase58": "<seedBase58>",
  "privateKeyBase58": "<privateKeyBase58>",
  "publicKeyBase58": "oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ"
};

const credential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/vc/status-list/2021/v1"
  ],
  "credentialStatus": {
    "id": "https://trustvc.github.io/did/credentials/statuslist/1#1",
    "statusListCredential": "https://trustvc.github.io/did/credentials/statuslist/1",
    "statusListIndex": "1",
    "statusPurpose": "revocation",
    "type": "StatusList2021Entry"
  },
  "issuanceDate": "2024-04-01T12:19:52Z",
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["Person"],
    "name": "TrustVC"
  },
  "expirationDate": "2029-12-03T12:19:52Z",
  "issuer": "did:web:trustvc.github.io:did:1",
  "type": [
    "VerifiableCredential"
  ]
};

const signedCredential = await signCredential(credential, keyPair);

if (signedCredential.signed) {
  console.log('Signed Credential:', signedCredential.signed);
} else {
  console.error('Error:', signedCredential.error);
}
```

#### ECDSA-SD-2023 Signing

```ts
import { signCredential } from '@trustvc/w3c-vc';

const ecdsaKeyPair = {
  "id": "did:web:trustvc.github.io:did:1#multikey-1",
  "type": "Multikey",
  "controller": "did:web:trustvc.github.io:did:1",
  "secretKeyMultibase": "<secretKeyMultibase>",
  "publicKeyMultibase": "zDnaekGZTbQBerwcehBSXLqAg6s55hVEBms1zFy89VHXtJSa9"
};

const credential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/data-integrity/v2"
  ],
  "issuanceDate": "2024-04-01T12:19:52Z",
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["Person"],
    "name": "TrustVC",
    "billOfLadingName": "Acme Corp"
  },
  "expirationDate": "2029-12-03T12:19:52Z",
  "issuer": "did:web:trustvc.github.io:did:1",
  "type": ["VerifiableCredential"]
};

// Sign with mandatory pointers (always included in derived credentials)
const signedCredential = await signCredential(credential, ecdsaKeyPair, 'ecdsa-sd-2023', {
  mandatoryPointers: ['/credentialSubject/id', '/credentialSubject/type']
});

if (signedCredential.signed) {
  console.log('Signed Credential:', signedCredential.signed);
} else {
  console.error('Error:', signedCredential.error);
}
```

### 2. Verifying a Credential
The verifyCredential function allows you to verify a signed Verifiable Credential using BBS+ or ECDSA-SD-2023 signature schemes.

#### BBS+ Verification

```ts
import { verifyCredential } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - credential (SignedVerifiableCredential): The credential to be verified.
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - verificationResult.verified (boolean): Whether the verification was successful.
 *   - verificationResult.error (string): The error message if the verification failed.
 */

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1'
  ],
  credentialStatus: {
    id: 'https://trustvc.github.io/did/credentials/statuslist/1#1',
    statusListCredential: 'https://trustvc.github.io/did/credentials/statuslist/1',
    statusListIndex: '1',
    statusPurpose: 'revocation',
    type: 'StatusList2021Entry'
  },
  issuanceDate: '2024-04-01T12:19:52Z',
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: [ 'Person' ],
    name: 'TrustVC'
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: [ 'VerifiableCredential' ],
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-10-02T09:04:07Z',
    proofPurpose: 'assertionMethod',
    proofValue: 'tissP5pJF1q4txCMWNZI5LgwhXMWrLI8675ops8FwlQE/zBUQnVO9Iey505MjkNDD5GdmQmnb6+RUKkLVGEJLIJrKQXlU3Xr4DlMW7ShH/sIpuvZoobGs/0hw/B5agXz8cVWfnDGWtDYciVh0rwQvg==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1'
  }
};

const verificationResult = await verifyCredential(credential);

if (verificationResult.verified) {
  console.log('Credential verified successfully.');
} else {
  console.error('Verification failed:', verificationResult.error);
}
```

#### ECDSA-SD-2023 Verification

> **Note**: For ECDSA-SD-2023 credentials with selective disclosure, you typically need to derive the credential first using `deriveCredential()` before verification. The example below shows verification of a base credential.

```ts
import { verifyCredential } from '@trustvc/w3c-vc';

const ecdsaCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/data-integrity/v2'
  ],
  issuanceDate: '2024-04-01T12:19:52Z',
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: ['Person'],
    name: 'TrustVC',
    billOfLadingName: 'Acme Corp'
  },
  expirationDate: '2029-12-03T12:19:52Z',
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

const verificationResult = await verifyCredential(ecdsaCredential);

if (verificationResult.verified) {
  console.log('ECDSA-SD-2023 Credential verified successfully.');
} else {
  console.error('Verification failed:', verificationResult.error);
}
```

### 3. Deriving a Credential

The deriveCredential function allows you to derive a new credential with selective disclosure using either BBS+ or ECDSA-SD-2023 signature schemes.

#### BBS+ Selective Disclosure

```ts
import { deriveCredential } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - credential (SignedVerifiableCredential): The verifiable credential to be selectively disclosed.
 * - revealedAttributes (ContextDocument): The attributes from the credential that should be revealed in the derived proof.
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - derived (DerivedProof): The selectively disclosed credential with the derived proof.
 *   - error (string): The error message in case of failure.
 */

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1'
  ],
  credentialStatus: {
    id: 'https://trustvc.github.io/did/credentials/statuslist/1#1',
    statusListCredential: 'https://trustvc.github.io/did/credentials/statuslist/1',
    statusListIndex: '1',
    statusPurpose: 'revocation',
    type: 'StatusList2021Entry'
  },
  issuanceDate: '2024-04-01T12:19:52Z',
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: [ 'Person' ],
    name: 'TrustVC'
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: [ 'VerifiableCredential' ],
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-10-02T09:04:07Z',
    proofPurpose: 'assertionMethod',
    proofValue: 'tissP5pJF1q4txCMWNZI5LgwhXMWrLI8675ops8FwlQE/zBUQnVO9Iey505MjkNDD5GdmQmnb6+RUKkLVGEJLIJrKQXlU3Xr4DlMW7ShH/sIpuvZoobGs/0hw/B5agXz8cVWfnDGWtDYciVh0rwQvg==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1'
  }
};

const revealedAttributes = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1'
  ],
  credentialSubject: {
    type: [ 'Person' ],
    '@explicit': true
  },
  type: [ 'VerifiableCredential' ]
};

const derivedResult = await deriveCredential(credential, revealedAttributes);

if (derivedResult.derived) {
  console.log('Derived Credential:', derivedResult.derived);
} else {
  console.error('Error:', derivedResult.error);
}
```

#### ECDSA-SD-2023 Selective Disclosure

```ts
import { deriveCredential } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - credential (SignedVerifiableCredential): The verifiable credential to be selectively disclosed.
 * - revealedAttributes (string[]): Array of JSON pointers specifying which fields to reveal.
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - derived (DerivedProof): The selectively disclosed credential with the derived proof.
 *   - error (string): The error message in case of failure.
 */

const ecdsaCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/data-integrity/v2'
  ],
  issuanceDate: '2024-04-01T12:19:52Z',
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: ['Person'],
    name: 'TrustVC',
    billOfLadingName: 'Acme Corp'
  },
  expirationDate: '2029-12-03T12:19:52Z',
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

// Reveal only the billOfLadingName field (mandatory pointers are always included)
const selectivePointers = ['/credentialSubject/billOfLadingName'];

const derivedResult = await deriveCredential(ecdsaCredential, selectivePointers);

if (derivedResult.derived) {
  console.log('Derived ECDSA-SD-2023 Credential:', derivedResult.derived);
} else {
  console.error('Error:', derivedResult.error);
}
```

### 4. Validate if payload meets the schema

```ts
import { isRawDocument, isSignedDocument } from '@trustvc/w3c-vc';

/**
 * Parameters:
 * - document (RawVerifiableCredential | SignedVerifiableCredential | unknown): The raw credential to be checked.
 * 
 * Returns:
 * - Returns true if the document is a raw credential, false otherwise.
 */

const document = {
  ...
}

const result1 = isRawDocument(document);
console.log('isRawDocument', result1);

const result2 = isSignedDocument(document);
console.log('isSignedDocument', result2);
