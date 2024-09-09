# TrustVC W3C Issuer

A library to facilitate the creation of [Decentralized Identifiers](https://www.w3.org/TR/did-core/) DIDs v1, specifically [`did:web`](https://w3c-ccg.github.io/did-method-web/), for the signing of [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) v1.1.

## Features
- Create private key pairs for specific [Signature Suites](https://w3c-ccg.github.io/ld-cryptosuite-registry/) used for signing Verifiable Credentials (e.g., BBS).
- Generate DID private key pairs and DID documents.

<br>

________________________________

## Functions
### 1. Create Private Key

`generateKeyPair` function helps to generate a signature Key Pair.

```ts
import { generateKeyPair, VerificationType } from '@trustvc/w3c-issuer';

/**
 * Parameters:
 * - options (GenerateKeyPairOptions)
 * - options.type (VerificationType): Key Pair algo type for Signature
 * - options.seedBase58? (string): 32 byte base58 encoded seed (e.g. FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN) (optional)
 * - options.privateKeyBase58? (string): private key value (optional)
 * - options.publicKeyBase58? (string): public key value (optional)
 * 
 * Returns:
 * - A Promise that resolves to:
 *   - generatedKeyPair.type (VerificationType): Key Pair algo.
 *   - generatedKeyPair.seedBase58 (string): 32 byte base58 encoded seed
 *   - generatedKeyPair.privateKeyBase58 (string): Derieve private key from seed
 *   - generatedKeyPair.publicKeyBase58 (string): Detrieve public key from seed
 */ 

const options = {
  type: VerificationType.Bls12381G2Key2020,
  seedBase58: undefined
}

const generatedKeyPair = await generateKeyPair(options);
console.log('generatedKeyPair: ', generatedKeyPair)
```

<details>
  <summary>generatedKeyPair Result</summary>

  ```js
  generatedKeyPair: {
    type: 'Bls12381G2Key2020',
    seedBase58: 'Bi3PwkefLww65R5X1pBjfMoMGQU1JEYLNScYEFGof2jU',
    privateKeyBase58: '6YA2TufSGoEycKZQYAgceQW8ctsyvfLaRyujA5vChC7Y',
    publicKeyBase58: '26JYXd5XRLLoLohrc9RxRXkCazujKknDsEN4ft9911APQD8WbcNCKQ8d65jrAGohUpwitXzGXn7FwMqQGZtGP48n3tsR1pMNW1WoKQLkAaoeY1CweAyKoYqj1M3YzmFimmr1'
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
import { VerificationType, issueDID } from '@trustvc/w3c-issuer';

/**
 * Parameters:
 * - options (IssuedDIDOption)
 * - options.domain (string): URL where the DID Document will be located
 * - options.type (VerificationType): Key Pair algo.
 * - options.seedBase58? (string): 32 byte base58 encoded seed (optional)
 * - options.privateKeyBase58? (string): Derieved private key from seed (optional)
 * - options.publicKeyBase58? (string): Detrieved public key from seed (optional)
 *
 * Returns:
 * - A Promise that resolves to:
 *   - issuedDID.wellKnownDid (DidWellKnownDocument): DID Document generated for the specified domain
 *   - issuedDID.didKeyPairs (PrivateKeyPair): DID Key Pair containing key id and controller
 */

const options = {
  domain: 'https://example.com/.well-known/did.json',
  type: VerificationType.Bls12381G2Key2020,
  seedBase58: 'Bi3PwkefLww65R5X1pBjfMoMGQU1JEYLNScYEFGof2jU',
  privateKeyBase58: '6YA2TufSGoEycKZQYAgceQW8ctsyvfLaRyujA5vChC7Y',
  publicKeyBase58: '26JYXd5XRLLoLohrc9RxRXkCazujKknDsEN4ft9911APQD8WbcNCKQ8d65jrAGohUpwitXzGXn7FwMqQGZtGP48n3tsR1pMNW1WoKQLkAaoeY1CweAyKoYqj1M3YzmFimmr1'
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
        type: 'Bls12381G2Key2020',
        id: 'did:web:example.com#keys-1',
        controller: 'did:web:example.com',
        publicKeyBase58: '26JYXd5XRLLoLohrc9RxRXkCazujKknDsEN4ft9911APQD8WbcNCKQ8d65jrAGohUpwitXzGXn7FwMqQGZtGP48n3tsR1pMNW1WoKQLkAaoeY1CweAyKoYqj1M3YzmFimmr1'
      }
    ],
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/bls12381-2020/v1'
    ],
    authentication: [ 'did:web:example.com#keys-1' ],
    assertionMethod: [ 'did:web:example.com#keys-1' ],
    capabilityInvocation: [ 'did:web:example.com#keys-1' ],
    capabilityDelegation: [ 'did:web:example.com#keys-1' ]
  }
  didKeyPairs: {
    id: 'did:web:example.com#keys-1',
    type: 'Bls12381G2Key2020',
    controller: 'did:web:example.com',
    seedBase58: 'Bi3PwkefLww65R5X1pBjfMoMGQU1JEYLNScYEFGof2jU',
    privateKeyBase58: '6YA2TufSGoEycKZQYAgceQW8ctsyvfLaRyujA5vChC7Y',
    publicKeyBase58: '26JYXd5XRLLoLohrc9RxRXkCazujKknDsEN4ft9911APQD8WbcNCKQ8d65jrAGohUpwitXzGXn7FwMqQGZtGP48n3tsR1pMNW1WoKQLkAaoeY1CweAyKoYqj1M3YzmFimmr1'
  }
  ```
</details>
