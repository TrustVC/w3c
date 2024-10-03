# W3C Credential Status

[Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/) refers to a method of representing the revocation/suspension status of multiple items (such as digital certificates or credentials) using a bitstring (a sequence of bits). This technique allows for efficient tracking and management of which items are valid or revoked without needing to maintain extensive individual records for each item.

## Revoking/Suspending a VC

The revocation or suspension of a [Verifiable Credentials v1.1.
](https://www.w3.org/TR/vc-data-model/) is achieved by changing the binary value of the bitstring at its given position in the bitstring. Every time the bitstring state changes, it must be compressed, encoded, and published as a Status VC of type `StatusList2021Entry`.

This module provides functionality to create/updat a signed Verifiable Credential (VC) for credential status, using a specified cryptographic suite and key pair. It supports the creation of different types of credential status VCs such as [StatusList2021Credential](https://www.w3.org/TR/2023/WD-vc-status-list-20230427/).

# Table of Contents

- [W3C Credential Status](#w3c-credential-status)
  - [Revoking/Suspending a VC](#revokingsuspending-a-vc)
- [Table of Contents](#table-of-contents)
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
      - [Parameters:](#parameters)
    - [`signCredential`](#signcredential)
      - [Parameters:](#parameters-1)
    - [`StatusList`](#statuslist)
      - [Constructor](#constructor)
      - [Parameters:](#parameters-2)
      - [Methods](#methods)
  - [License](#license)

---

## Installation

To install the package, use:

```sh
npm install @trustvc/w3c-credential-status
```

---

## Features

- Create Credential Status Verifiable Credentials (e.g., BBS).
- Update revocation status for existing VC.

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
const hostingUrl = https://example.com/credentials/statuslist/1;
```

You can create a new StatusList object with a default or custom length. By default, the list is 131,072 bits (16 KB), but you can adjust it if needed.

```typescript
import { StatusList } from '@trustvc/w3c-credential-status';

// Initialize status list with a default length (16 KB or 131,072 bits)
const credentialStatus = new StatusList({ length: 131072 });
```

#### Step 3 - Select the Purpose for the Status List

The StatusList can serve different purposes, such as revocation or suspension of credentials. You can choose the purpose using the following setup:

```typecript
type CredentialStatusPurpose = 'revocation' | 'suspension';

// Choose between 'revocation' or 'suspension'
const purpose: CredentialStatusPurpose = "revocation";

```

#### Step 4 - Retrieve and update the status of the index of the StatusList

The `getStatus` method allows you to check whether a specific index in the status list is active (false) or revoked/suspended (true):

```typescript
// Check the status of a specific index in the list
const currentIndexStatus: boolean = credentialStatus.getStatus(index); //pick index of your choice between length 0 - credentialStatus.length;

console.log(currentIndexStatus); // to check current index status

//To change the status (revoked/suspended or active), use the setStatus method:(true = revoked/suspended, false = active)

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
 * - type (VCCredentialStatusType): The type of the credential status VC. Defaults to 'StatusList2021Credential'.
 * - cryptoSuite (string): The cryptosuite to be used for signing. Defaults to 'BbsBlsSignature2020'.
 *
 * Returns:
 * - A Promise that resolves to:
 * - RawCredentialStatusVC: The signed credential status Verifiable Credential.
 */

const options = {
    id: hostingUrl,
    credentialSubject: {
      id: `${hostingUrl}#list`,
      type: 'StatusList2021',
      statusPurpose: purpose,
      encodedList,
    };

const keyPair: PrivateKeyPair = {
  controller: 'did:web:example.com',
  // Add additional key pair properties here (privateKeyBase58, publicKeyBase58)
};

const credentialStatusVC = await createCredentialStatusPayload(options, keyPair);

console.log('Credential Status VC:', credentialStatusVC);

// Sign the credential status payload
const { signed, error } = await signCredential(credentialStatusPayload, keypairData);

if (error) {
  throw new Error(error);
}

const signedCredentialStatusVC = signed;

```

<details>
  <summary>createCredentialStatusPayload Result</summary>

```js
generatedKeyPair: {
  type: 'Bls12381G2Key2020',
  seedBase58: 'Bi3PwkefLww65R5X1pBjfMoMGQU1JEYLNScYEFGof2jU',
  privateKeyBase58: '6YA2TufSGoEycKZQYAgceQW8ctsyvfLaRyujA5vChC7Y',
  publicKeyBase58: '26JYXd5XRLLoLohrc9RxRXkCazujKknDsEN4ft9911APQD8WbcNCKQ8d65jrAGohUpwitXzGXn7FwMqQGZtGP48n3tsR1pMNW1WoKQLkAaoeY1CweAyKoYqj1M3YzmFimmr1'
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
  console.error(chalk.red(`Invalid URL provided: ${hostingUrl}`));
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

// Create the credential status payload
const credentialStatusPayload = await createCredentialStatusPayload(
  {
    id: hostingUrl,
    credentialSubject: {
      id: `${hostingUrl}#list`,
      type: 'StatusList2021',
      statusPurpose: purpose,
      encodedList,
    },
  },
  keypairData, // Your key pair data
  'StatusList2021Credential',
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

Creates a credential status payload.

#### Parameters:

`credentialStatusData (object)`: The data for the credential status.

`keypairData (object)`: The key pair data used for signing.

`credentialType (string)`: The type of credential (e.g., 'StatusList2021Credential').

### `signCredential`

Signs the credential status payload.

#### Parameters:

`credentialPayload (object)`: The credential status payload.

`keypairData (object)`: The key pair data used for signing.

### `StatusList`

Creates a new StatusList instance with a specified length and an optional initial buffer.

#### Constructor

```typescript
constructor({ length, buffer }: BitstringStatusListOption)
```

#### Parameters:

`length (number)`: The length of the bitstring.

`buffer (Buffer | undefined)`: An optional buffer containing the initial state of the bitstring.

#### Methods

`setStatus(index: number, status: boolean): void`

`getStatus(index: number): boolean`

`encode(): Promise<string>`

`static decode({ encodedList }: { encodedList: string }): Promise<StatusList>`

---

## License

---
