# w3c-vc

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
 * - cryptoSuite (optional): The cryptosuite to be used for signing. Defaults to "BbsBlsSignature2020".
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - signedCredential.signed (SignedVerifiableCredential): The signed credential.
 *   - signedCredential.error (string): The error message in case of failure.
 */
const signedCredential = await signCredential(credential, keyPair);

if (signedCredential.signed) {
  console.log('Signed Credential:', signedCredential.signed);
} else {
  console.error('Error:', signedCredential.error);
}

```

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
const verificationResult = await verifyCredential(credential);

if (verificationResult.verified) {
  console.log('Credential verified successfully.');
} else {
  console.error('Verification failed:', verificationResult.error);
}

```
