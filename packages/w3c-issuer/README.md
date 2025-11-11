# TrustVC W3C Issuer

A library to facilitate the creation of [Decentralized Identifiers](https://www.w3.org/TR/did-core/) DIDs v1, specifically [`did:web`](https://w3c-ccg.github.io/did-method-web/), for the signing of [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) v1.1.

## Installation
To install the package, use:

```sh
npm install @trustvc/w3c-issuer
```

## Features
- Create private key pairs for specific signature suites used for signing Verifiable Credentials: [ECDSA-SD-2023](https://w3c.github.io/vc-di-ecdsa/#ecdsa-sd-2023), [BBS-2023](https://w3c.github.io/vc-di-bbs/#bbs-2023), and [legacy suites](https://w3c-ccg.github.io/ld-cryptosuite-registry/).
- Generate DID private key pairs and DID documents.

<br>

________________________________

## Usage
### 1. Create Private Key

`generateKeyPair` function helps to generate a signature Key Pair.

```ts
import { generateKeyPair, CryptoSuite } from '@trustvc/w3c-issuer';

/**
 * Parameters:
 * - options (GenerateKeyPairOptions)
 * - options.type (CryptoSuite | VerificationType): Key Pair algo type for Signature
 * - options.seedBase58? (string): 32 byte base58 encoded seed (e.g. FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN) (optional)
 * - options.privateKeyBase58? (string): private key value (optional)
 * - options.publicKeyBase58? (string): public key value (optional)
 * - options.secretKeyMultibase? (string): private key value in multibase format (optional)
 * - options.publicKeyMultibase? (string): public key value in multibase format (optional)
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - generatedKeyPair.type (CryptoSuite | VerificationType): Key Pair algo.
 *   - generatedKeyPair.secretKeyMultibase (string): Private key in multibase format (for modern cryptosuites)
 *   - generatedKeyPair.publicKeyMultibase (string): Public key in multibase format (for modern cryptosuites)
 *   - generatedKeyPair.seedBase58 (string): 32 byte base58 encoded seed (for legacy types only)
 *   - generatedKeyPair.privateKeyBase58 (string): Private key in base58 format (for legacy types only)
 *   - generatedKeyPair.publicKeyBase58 (string): Public key in base58 format (for legacy types only)
 */ 

const options = {
  type: CryptoSuite.EcdsaSd2023,
  seedBase58: undefined
}

const generatedKeyPair = await generateKeyPair(options);
console.log('generatedKeyPair: ', generatedKeyPair)
```

<details>
  <summary>generatedKeyPair Result</summary>

  ```js
  generatedKeyPair: {
    type: 'ecdsa-sd-2023',
    secretKeyMultibase: '<secretKeyMultibase>',
    publicKeyMultibase: '<publicKeyMultibase>'
  }
  ```
</details>

### 2. Generate DID Key Pair and DID Document

`issueDID` function helps to generate __`did:web` DID Document__, together with the __DID Private Key Pair__.

> (wellKnownDid) __`did:web` DID Document__ needs to be hosted. \
*Read [here]() for more instructions.* \
> \
> (didKeyPairs) __DID Private Key Pair__ needs to be kept securely. Required for signing Verifiable Credential. \
*Read [here]() for more signing instructions.*

```ts
import { CryptoSuite, issueDID } from '@trustvc/w3c-issuer';

/**
 * Parameters:
 * - options (IssuedDIDOption)
 * - options.domain (string): URL where the DID Document will be located
 * - options.type (CryptoSuite | VerificationType): Key Pair algo.
 * - options.secretKeyMultibase? (string): Private key in multibase format (optional, for modern cryptosuites)
 * - options.publicKeyMultibase? (string): Public key in multibase format (optional, for modern cryptosuites)
 * - options.seedBase58? (string): 32 byte base58 encoded seed (optional, for legacy types)
 * - options.privateKeyBase58? (string): Private key in base58 format (optional, for legacy types)
 * - options.publicKeyBase58? (string): Public key in base58 format (optional, for legacy types)
 *
 * Returns:
 * - A Promise that resolves to:
 *   - issuedDID.wellKnownDid (DidWellKnownDocument): DID Document generated for the specified domain
 *   - issuedDID.didKeyPairs (PrivateKeyPair): DID Key Pair containing key id and controller
 */

const options = {
  domain: 'https://example.com/.well-known/did.json',
  type: CryptoSuite.EcdsaSd2023,
  secretKeyMultibase: '<secretKeyMultibase>',
  publicKeyMultibase: '<publicKeyMultibase>'
}

const issuedDID = await issueDID(options);

const { wellKnownDid, didKeyPairs } = issuedDID;
console.log("wellKnownDid:", wellKnownDid)
console.log("didKeyPairs:", didKeyPairs)
```
<details>
  <summary>issueDID Result</summary>

  ```js
  wellKnownDid: {
    id: 'did:web:example.com',
    verificationMethod: [
      {
        type: 'Multikey',
        id: 'did:web:example.com#multikey-1',
        controller: 'did:web:example.com',
        publicKeyMultibase: '<publicKeyMultibase>'
      }
    ],
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/multikey/v1'
    ],
    authentication: [ 'did:web:example.com#multikey-1' ],
    assertionMethod: [ 'did:web:example.com#multikey-1' ],
    capabilityInvocation: [ 'did:web:example.com#multikey-1' ],
    capabilityDelegation: [ 'did:web:example.com#multikey-1' ]
  }
  didKeyPairs: {
    '@context': 'https://w3id.org/security/multikey/v1',
    id: 'did:web:example.com#multikey-1',
    type: 'Multikey',
    controller: 'did:web:example.com',
    secretKeyMultibase: '<secretKeyMultibase>',
    publicKeyMultibase: '<publicKeyMultibase>'
  }
  ```
</details>
