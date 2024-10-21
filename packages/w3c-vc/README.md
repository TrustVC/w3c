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

<details>
  <summary>verifyCredential Result</summary>

  ```js
  Credential verified successfully.
  ```
</details>

### 3. Deriving a Credential

The deriveCredential function allows you to derive a new credential with selective disclosure using the BBS+ signature proof.

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

<details>
  <summary>deriveCredential Result</summary>

  ```js
  Derived Credential: {
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
      type: [ 'Person' ]
    },
    expirationDate: '2029-12-03T12:19:52Z',
    issuer: 'did:web:trustvc.github.io:did:1',
    id: 'urn:bnid:_:c14n0',
    type: [ 'VerifiableCredential' ],
    proof: {
      type: 'BbsBlsSignatureProof2020',
      created: '2024-10-02T09:04:07Z',
      nonce: 'YsFIiujnENBLMsuuXhyctszyGC72SLqiOvlT8OcvSOD6eDcehcGJgbTx5k+tfK00K5M=',
      proofPurpose: 'assertionMethod',
      proofValue: 'ABAA/++QJhxxPdA340RTSEwPfgmB1Z3kUnhOCE4ReITG6nSNhHvZxdP24jsvBUzyecIArsS2FZdgscCNVP2K2LvEXJteLh/pDjOVsTMOyuVuDaOPYclXxOJR4D3UQtL0DFhu4wC0NaZ+NXV8j1xG/zyJ+lzn4jrKaPhHyuySKFjCZnlQNVx01Cm3pKzgL94GdKsXsEsAAAB0p7aO6wVq4hcyOKmEK4UALxZHTIMet/QMoVlHI017QSQi8hHu+hnGEmmmpuyluTgrAAAAAnIbawi/noqB4Fb+Q3C8ck73LxWVeqBrisWfadhCfep0FVRp/l2McLCsr9mfcDwhFpDoPfh8jza82Mk0s15Q9J+LwH39CGtwjatgL22bM4Ulnwe+GsyYoOgcN6vbtkmYdw7TNJ+H76mRq1K82vDJ6sQAAAADDUVU/P0Exnz7Dvs5V0rSHEur/ySddDgjU7cZZVRjTARzCr7xpcs/yd9W6FGzvxDSIqwTjBgnah9I6v4QDOAdvVyjoZ+Joppjt1rIER9AYXxIN++wCqQtWqaC/X7jPtPb',
      verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1'
    }
  }
  ```
</details>
