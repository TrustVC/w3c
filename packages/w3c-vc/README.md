# TrustVC W3C VC

This repository provides utilities for signing and verifying Verifiable Credentials (VCs) using the BBS+ signature scheme. These functions can be used to ensure the authenticity and integrity of VCs within a W3C-compliant ecosystem.

## Installation
To install the package, use:

```sh
npm install @trustvc/w3c-vc
```

## Usage
### 1. Signing a Credential

The signCredential function allows you to sign a Verifiable Credential using the BBS+ signature scheme.

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
  "id": "did:web:nghaninn.github.io:did:1#keys-1",
  "controller": "did:web:nghaninn.github.io:did:1",
  "type": "Bls12381G2Key2020",
  "seedBase58": "GW1FUS9Xg7T6xsZDCVx48EM1uuo25k435U77ftZrQEYB",
  "privateKeyBase58": "5LbHsFCpW4YzCNWbqhZJkWyVnayp5gEDsUvrq47qLSN6",
  "publicKeyBase58": "rDAqEpT2FJspbHL9gM1utkT2UNADn59HMiouSLoktZw8B1GsKyXB3Wd5fgDucCbMDRLcQhWHEuQrrKSf7P2NyqgFwHGbzNQ9X8EPbXakSr2cbqLghmzkGvE4ppEHVkBYc83"
};

const credential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/vc/status-list/2021/v1"
  ],
  "credentialStatus": {
    "id": "https://nghaninn.github.io/did/credentials/statuslist/1#1",
    "statusListCredential": "https://nghaninn.github.io/did/credentials/statuslist/1",
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
  "issuer": "did:web:nghaninn.github.io:did:1",
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

<details>
  <summary>signCredential Result</summary>

  ```js
  Signed Credential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld',
      'https://w3id.org/security/bbs/v1',
      'https://w3id.org/vc/status-list/2021/v1'
    ],
    credentialStatus: {
      id: 'https://nghaninn.github.io/did/credentials/statuslist/1#1',
      statusListCredential: 'https://nghaninn.github.io/did/credentials/statuslist/1',
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
    issuer: 'did:web:nghaninn.github.io:did:1',
    type: [ 'VerifiableCredential' ],
    proof: {
      type: 'BbsBlsSignature2020',
      created: '2024-10-02T08:33:00Z',
      proofPurpose: 'assertionMethod',
      proofValue: 'sIfRmqFYgFMJgp0vbUMitkaiN7/YQjrpGB4hUQd5u+LMMq8hnSSvJeWZmzzomZRzEOmOujgAwamaKvwB9FwRX50F2Iq7rPFPlsnsFcde72wS9jGven/6bqc6fYgNp7iOzafE1IlHG8tpJm7L0ZvW0Q==',
      verificationMethod: 'did:web:nghaninn.github.io:did:1#keys-1'
    }
  }
  ```
</details>

### 2. Verifying a Credential
The verifyCredential function allows you to verify a signed Verifiable Credential using the BBS+ signature scheme.

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
    id: 'https://nghaninn.github.io/did/credentials/statuslist/1#1',
    statusListCredential: 'https://nghaninn.github.io/did/credentials/statuslist/1',
    statusListIndex: '1',
    statusPurpose: 'revocation',
    type: 'StatusList2021Entry'
  },
  issuanceDate: '2024-04-01T12:19:52Z',
  credentialSubject: {
    id: 'did:example:b34ca6cd37bbf23',
    type: [ 'Person' ],
    name: 'Trust'
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:nghaninn.github.io:did:1',
  type: [ 'VerifiableCredential' ],
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-10-02T08:21:26Z',
    proofPurpose: 'assertionMethod',
    proofValue: 'prIO8mNBjgvvEzvh94eamfjHwF7zNOms23n1BcoQe5teLWpdJxDuB25dCfWYsu+UTqbfonSktBIjTorzQPdTuHwVKZt/t0Z+9j5uMj+65hxtIW5Osz33833c0z6UhQuh2CsUpfYXtVuDtUZADWGDYw==',
    verificationMethod: 'did:web:nghaninn.github.io:did:1#keys-4'
  }
};

const verificationResult = await verifyCredential(credential);

if (verificationResult.verified) {
  console.log('Credential verified successfully.');
} else {
  console.error('Verification failed:', verificationResult.error);
}
```

<details>
  <summary>verifyCredential Result</summary>

  ```js
  Credential verified successfully.
  ```
</details>
