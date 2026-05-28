# TrustVC W3C Issuer

A library to facilitate the creation of [Decentralized Identifiers](https://www.w3.org/TR/did-core/) DIDs v1, supporting both [`did:web`](https://w3c-ccg.github.io/did-method-web/) (host a DID document) and [`did:key`](https://w3c-ccg.github.io/did-key-spec/) (self-certifying, no hosting required), for the signing of [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) v1.1 and [v2.0](https://www.w3.org/TR/vc-data-model-2.0/).

## Installation
To install the package, use:

```sh
npm install @trustvc/w3c-issuer
```

## Features
- Create private key pairs for specific signature suites used for signing Verifiable Credentials: [ECDSA-SD-2023](https://w3c.github.io/vc-di-ecdsa/#ecdsa-sd-2023), [BBS-2023](https://w3c.github.io/vc-di-bbs/#bbs-2023), and [legacy suites](https://w3c-ccg.github.io/ld-cryptosuite-registry/).
- Generate DID private key pairs and DID documents.
- Issue self-certifying `did:key` DIDs (P-256 for ECDSA-SD-2023, BLS12-381 G2 for BBS-2023) — no hosting required.

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

### 3. Generate a `did:key` Key Pair

`generateDidKeyPair` issues a self-certifying [`did:key`](https://w3c-ccg.github.io/did-key-spec/) DID together with the matching Multikey private key pair. Unlike `did:web`, there is no DID document to host — the public key is encoded directly into the DID, so the DID document is reconstructed deterministically by any verifier from the identifier alone.

> __DID Private Key Pair__ needs to be kept securely. Required for signing Verifiable Credentials. \
> __Issuer identity__ is not bound to any domain. If you need to bind a `did:key` to a real-world entity, use an out-of-band mechanism (trust registry, delegation credential, etc.). See [`./src/did-key/README.md`](./src/did-key/README.md) for the trust-model discussion.

```ts
import { CryptoSuite, generateDidKeyPair, parseDidKey } from '@trustvc/w3c-issuer';

/**
 * Parameters:
 * - cryptosuite (CryptoSuite): Either CryptoSuite.EcdsaSd2023 (P-256) or CryptoSuite.Bbs2023 (BLS12-381 G2)
 * - options.seedBase58? (string): 32 byte base58 encoded seed for deterministic BBS-2023 generation (optional, ignored for ECDSA-SD-2023)
 *
 * Returns:
 * - A Promise that resolves to:
 *   - did (string): The resulting did:key DID
 *   - didKeyPairs (PrivateKeyPair): Multikey private key pair scoped to the new DID
 */

const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
console.log('did:', did);
console.log('didKeyPairs:', didKeyPairs);
```

<details>
  <summary>generateDidKeyPair Result</summary>

  ```js
  did: 'did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc'
  didKeyPairs: {
    '@context': 'https://w3id.org/security/multikey/v1',
    id: 'did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc#zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc',
    type: 'Multikey',
    controller: 'did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc',
    publicKeyMultibase: 'zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc',
    secretKeyMultibase: '<secretKeyMultibase>'
  }
  ```
</details>

`parseDidKey` decodes a `did:key` identifier back into its key type and raw public key bytes — useful if you receive a `did:key` from elsewhere and need to inspect it:

```ts
const info = parseDidKey('did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc');
// info.keyType === 'P-256'
// info.publicKey is a Uint8Array of the compressed 33-byte P-256 public key
// info.verificationMethodId === 'did:key:zDna...#zDna...'
```

**Supported key types:** `P-256` (for `ecdsa-sd-2023`) and `BLS12-381 G2` (for `bbs-2023`). Other `did:key` types defined in the spec (Ed25519, secp256k1, P-384, etc.) are rejected at parse time because no matching cryptosuite is wired up in `@trustvc/w3c-vc`.
