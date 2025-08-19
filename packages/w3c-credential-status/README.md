# TrustVC W3C Credential Status

Implements credential status management for Verifiable Credentials (VCs) using @trustvc/w3c-credential-status. It supports lifecycle operations such as revocation and suspension without altering the original credential, enabling verifiers to check a credential's current status. The project utilizes status lists and handles the credential validation process.

This package supports both **W3C VC Data Model v1.1** (legacy) and **W3C VC Data Model v2.0** (modern) specifications:

- **v1.1 Support**: Uses `StatusList2021Credential` with `StatusList2021Entry` credential status
- **v2.0 Support**: Uses `BitstringStatusListCredential` with `BitstringStatusListEntry` credential status

The [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/) specification (v2.0) and the legacy [Status List 2021](https://www.w3.org/TR/2023/WD-vc-status-list-20230427/) specification (v1.1) both refer to methods of representing the revocation/suspension status of multiple items (such as digital certificates or credentials) using a bitstring (a sequence of bits). This technique allows for efficient tracking and management of which items are valid or revoked without needing to maintain extensive individual records for each item.

## Revoking/Suspending a VC

The revocation or suspension of Verifiable Credentials is achieved by changing the binary value of the bitstring at its given position in the bitstring. Every time the bitstring state changes, it must be compressed, encoded, and published as a Status VC.

**For W3C VC Data Model v1.1:**
- Status VC type: `StatusList2021Credential`
- Credential status type: `StatusList2021Entry`
- Credential subject type: `StatusList2021`

**For W3C VC Data Model v2.0:**
- Status VC type: `BitstringStatusListCredential`
- Credential status type: `BitstringStatusListEntry`
- Credential subject type: `BitstringStatusList`

This module provides functionality to create/update a signed Verifiable Credential (VC) for credential status, using a specified cryptographic suite and key pair. It supports both legacy BBS+ signatures and modern ECDSA-SD-2023 cryptosuites.

## Table of Contents

- [W3C Credential Status](#w3c-credential-status)
  - [Revoking/Suspending a VC](#revokingsuspending-a-vc)
  - [Installation](#installation)
  - [Features](#features)
  - [Usage](#usage)
    - [1. Create Credential Status VC](#1-create-credential-status-vc)
      - [Step 1 - Importing the Package](#step-1---importing-the-package)
      - [Step 2 - Pick a Hosting URL and Create a new StatusList](#step-2---pick-a-hosting-url-and-create-a-new-statuslist)
      - [Step 3 - Select the Purpose for the Status List](#step-3---select-the-purpose-for-the-status-list)
      - [Step 4 - Retrieve and update the status of the index of the StatusList](#step-4---retrieve-and-update-the-status-of-the-index-of-the-statuslist)
      - [Step 5 - Encode the Status List](#step-5---encode-the-status-list)
      - [Step 6 - Create and sign the Credential Status Payload](#step-6---create-and-sign-the-credential-status-payload)
    - [2. Update revocation status for existing VC](#2-update-revocation-status-for-existing-vc)
      - [Step 1- Import Required Modules](#step-1--import-required-modules)
      - [Step 2 - Fetch Existing Credential Status VC](#step-2---fetch-existing-credential-status-vc)
      - [Step 3 - Update Credential Status](#step-3---update-credential-status)
      - [Step 4 - Encode and Sign the Credential Status](#step-4---encode-and-sign-the-credential-status)
  - [API Reference](#api-reference)
    - [`createCredentialStatusPayload`](#createcredentialstatuspayload)
    - [`signCredential`](#signcredential)
    - [`StatusList`](#statuslist)

---

## Installation

To install the package, use:

```sh
npm install @trustvc/w3c-credential-status
```

---

## Features

- **Dual Version Support**: Compatible with both W3C VC Data Model v1.1 and v2.0
- **Multiple Cryptosuites**: Supports BBS+ (legacy) and ECDSA-SD-2023 (modern) signatures
- **Flexible Status Types**: Create both `StatusList2021Credential` and `BitstringStatusListCredential`
- **Backward Compatibility**: Existing v1.1 implementations continue to work
- Create Credential Status Verifiable Credentials with various cryptographic suites
- Update revocation status for existing VCs

---

## Usage

### 1. Create Credential Status VC

#### Step 1 - Importing the Package

First, import the necessary modules from the package:

```typescript
import {
  createCredentialStatusPayload,
  CredentialStatusPurpose,
  StatusList,
} from '@trustvc/w3c-credential-status';
import { signCredential, SignedVerifiableCredential } from '@trustvc/w3c-vc';
```

#### Step 2 - Pick a Hosting URL and Create a new StatusList

Pick a URL where you'd like to host your credential status. (e.g., https://example.com/credentials/statuslist/1)

```typescript
const hostingUrl = 'https://example.com/credentials/statuslist/1';
```

You can create a new StatusList object with a default or custom length. By default, the list is 131,072 bits (16 KB), but you can adjust it if needed.

```typescript
import { StatusList } from '@trustvc/w3c-credential-status';

// Initialize status list with a default length (16 KB or 131,072 bits)
const credentialStatus = new StatusList({ length: 131072 });
```

#### Step 3 - Select the Purpose for the Status List

The StatusList can serve different purposes, such as revocation or suspension of credentials. You can choose the purpose using the following setup:

```typescript
type CredentialStatusPurpose = 'revocation' | 'suspension';

// Choose between 'revocation' or 'suspension'
const purpose: CredentialStatusPurpose = 'revocation';
```

#### Step 4 - Retrieve and update the status of the index of the StatusList

The `getStatus` method allows you to check whether a specific index in the status list is active (false) or revoked/suspended (true):

```typescript
// Check the status of a specific index in the list
//pick index of your choice between length 0 - credentialStatus.length;
const currentIndexStatus: boolean = credentialStatus.getStatus(index);

console.log(currentIndexStatus); // to check current index status

//To change the status (revoked/suspended or active),
//use the setStatus method:(true = revoked/suspended, false = active)

credentialStatus.setStatus(index, false);
```

#### Step 5 - Encode the Status List

Once you have made updates to the status list, you need to encode it for further use:

```typescript
// Encode the updated status list
const encodedList = await credentialStatus.encode();
```

#### Step 6 - Create and sign the Credential Status Payload

`createCredentialStatusPayload` function helps to create a signed credential status Verifiable Credential (VC).

```typescript
import { createCredentialStatusPayload } from '@trustvc/w3c-credential-status';
import { PrivateKeyPair } from '@trustvc/w3c-issuer';

/**
 * Parameters:
 * - options (CreateVCCredentialStatusOptions)
 * - options.id (string): The ID of the credential.
 * - options.credentialSubject (object): The credential subject.
 * - keyPair (PrivateKeyPair): The key pair options for signing
 * - type (VCCredentialStatusType): The type of the credential status VC. 
 *   Options: 'StatusList2021Credential' (v1.1) or 'BitstringStatusListCredential' (v2.0)
 * - cryptoSuite (string): The cryptosuite to be used for signing. 
 *   Options: 'BbsBlsSignature2020' (legacy) or 'ecdsa-sd-2023' (modern)
 *
 * Returns:
 * - A Promise that resolves to:
 * - RawCredentialStatusVC: The signed credential status Verifiable Credential.
 */

// Example for W3C VC Data Model v1.1 (legacy)
const optionsV1 = {
    id: hostingUrl,
    credentialSubject: {
      id: `${hostingUrl}#list`,
      type: 'StatusList2021', // v1.1 credential subject type
      statusPurpose: purpose,
      encodedList,
    };
}

const credentialStatusVCV1 = await createCredentialStatusPayload(
  optionsV1, 
  keyPair, 
  'StatusList2021Credential', // v1.1 credential type
  'BbsBlsSignature2020' // legacy cryptosuite
);

// Example for W3C VC Data Model v2.0 (modern)
const optionsV2 = {
    id: hostingUrl,
    credentialSubject: {
      id: `${hostingUrl}#list`,
      type: 'BitstringStatusList', // v2.0 credential subject type
      statusPurpose: purpose,
      encodedList,
    };
}

const credentialStatusVCV2 = await createCredentialStatusPayload(
  optionsV2, 
  keyPair, 
  'BitstringStatusListCredential', // v2.0 credential type
  'ecdsa-sd-2023' // modern cryptosuite
);

console.log('Credential Status VC:', credentialStatusVCV2);

// Sign the credential status payload
const { signed, error } = await signCredential(credentialStatusPayload, keypairData);

if (error) {
  throw new Error(error);
}

const signedCredentialStatusVC = signed;

```

<details>
  <summary>signCredential Result (v1.1 with BBS+)</summary>

```js
Signed Credential: {
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
}
```

</details>

<details>
  <summary>signCredential Result (v2.0 with ECDSA-SD-2023)</summary>

```js
Signed Credential: {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://w3id.org/security/data-integrity/v2'
  ],
  credentialStatus: {
    id: 'https://trustvc.github.io/did/credentials/statuslist/1#1',
    statusListCredential: 'https://trustvc.github.io/did/credentials/statuslist/1',
    statusListIndex: '1',
    statusPurpose: 'revocation',
    type: 'BitstringStatusListEntry'
  },
  validFrom: '2024-04-01T12:19:52Z',
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: [ 'Person' ],
    name: 'TrustVC'
  },
  validUntil: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: [ 'VerifiableCredential' ],
  proof: {
    type: 'DataIntegrityProof',
    cryptosuite: 'ecdsa-sd-2023',
    created: '2024-10-02T09:04:07Z',
    proofPurpose: 'assertionMethod',
    proofValue: 'u2V0AhVhAip...',
    verificationMethod: 'did:web:trustvc.github.io:did:1#multikey-1'
  }
}
```

</details>

---

### 2. Update revocation status for existing VC

#### Step 1- Import Required Modules

Begin by importing the necessary functions and classes from @trustvc/w3c-credential-status and other dependencies.

```typescript
import {
  createCredentialStatusPayload,
  CredentialStatusPurpose,
  fetchCredentialStatusVC,
  SignedCredentialStatusVC,
  StatusList,
} from '@trustvc/w3c-credential-status';
import { signCredential } from '@trustvc/w3c-vc';
```

#### Step 2 - Fetch Existing Credential Status VC

Retrieve the existing Credential Status Verifiable Credential (VC) from the hosted URL.

```typescript
const hostingUrl = 'https://example.com/credentials/statuslist/1';

let credentialStatusVC: SignedCredentialStatusVC;
try {
  credentialStatusVC = await fetchCredentialStatusVC(hostingUrl);
} catch (err: unknown) {
  console.error(`Invalid URL provided: ${hostingUrl}`);
  throw err;
}
```

#### Step 3 - Update Credential Status

Initialize the StatusList and update the desired status index.

```typescript
// Initialize StatusList with the existing encoded list
const statusList = await StatusList.decode({
  encodedList: credentialStatusVC.credentialSubject.encodedList,
});

// Define the purpose (e.g., 'revocation' or 'suspension')
const purpose: CredentialStatusPurpose = 'revocation';

// Update the status at a specific index
const indexToUpdate = 12345; // Example index
const newStatus = true; // true for revoked/suspended, false for active

statusList.setStatus(indexToUpdate, newStatus);
```

#### Step 4 - Encode and Sign the Credential Status

After updating the status list, encode it and create a signed credential status payload.

```typescript
// Encode the updated status list
const encodedList = await statusList.encode();

// Create the credential status payload (v1.1 example)
const credentialStatusPayload = await createCredentialStatusPayload(
  {
    id: hostingUrl,
    credentialSubject: {
      id: `${hostingUrl}#list`,
      type: 'StatusList2021', // Use 'BitstringStatusList' for v2.0
      statusPurpose: purpose,
      encodedList,
    },
  },
  keypairData, // Your key pair data
  'StatusList2021Credential', // Use 'BitstringStatusListCredential' for v2.0
  'BbsBlsSignature2020' // Use 'ecdsa-sd-2023' for modern cryptosuite
);

// Sign the credential status payload
const { signed, error } = await signCredential(credentialStatusPayload, keypairData);

if (error) {
  throw new Error(error);
}

const signedCredentialStatusVC = signed;
```

---

## API Reference

### `createCredentialStatusPayload`

> Creates a credential status payload for both W3C VC Data Model v1.1 and v2.0.
>
> #### Parameters:
>
> `credentialStatusData (object)`: The data for the credential status.
>
> `keypairData (object)`: The key pair data used for signing.
>
> `credentialType (VCCredentialStatusType)`: The type of credential. Options:
> - `'StatusList2021Credential'` (v1.1 legacy)
> - `'BitstringStatusListCredential'` (v2.0 modern)
>
> `cryptoSuite (CryptoSuiteName)`: The cryptosuite for signing. Options:
> - `'BbsBlsSignature2020'` (legacy BBS+ signatures)
> - `'ecdsa-sd-2023'` (modern ECDSA-SD-2023 signatures)

### `signCredential`

> Signs the credential status payload using the specified cryptosuite.
>
> #### Parameters:
>
> `credentialPayload (object)`: The credential status payload.
>
> `keypairData (object)`: The key pair data used for signing.

### `StatusList`

> Creates a new StatusList instance with a specified length and an optional initial buffer. Compatible with both v1.1 and v2.0 credential formats.
>
> #### Constructor
>
> ```typescript
> constructor({ length, buffer }: BitstringStatusListOption)
> ```
>
> #### Parameters:
>
> `length (number)`: The length of the bitstring.
>
> `buffer (Buffer | undefined)`: An optional buffer containing the initial state of the bitstring.
>
> #### Methods
>
> `setStatus(index: number, status: boolean): void`
>
> `getStatus(index: number): boolean`
>
> `encode(): Promise<string>`
>
> `static decode({ encodedList }: { encodedList: string }): Promise<StatusList>`

### Types

#### `VCCredentialStatusType`
```typescript
type VCCredentialStatusType = 'BitstringStatusListCredential' | 'StatusList2021Credential';
```

#### `CredentialStatusType`
```typescript
type CredentialStatusType = 'BitstringStatusListEntry' | 'StatusList2021Entry';
```

#### `VCCredentialSubjectType`
```typescript
type VCCredentialSubjectType = 'BitstringStatusList' | 'StatusList2021';
```

#### `CredentialStatusPurpose`
```typescript
type CredentialStatusPurpose = 'revocation' | 'suspension' | 'message';
```

## Migration Guide

### From v1.1 to v2.0

To migrate from W3C VC Data Model v1.1 to v2.0:

1. **Update credential types:**
   - `StatusList2021Credential` → `BitstringStatusListCredential`
   - `StatusList2021Entry` → `BitstringStatusListEntry`
   - `StatusList2021` → `BitstringStatusList`

2. **Update cryptosuite:**
   - `BbsBlsSignature2020` → `ecdsa-sd-2023`

3. **Update key pair format:**
   - Legacy BLS keys → Modern ECDSA multikey format

4. **Update contexts:**
   - v1.1 contexts → v2.0 contexts (handled automatically)

The `StatusList` class remains the same and works with both versions.
