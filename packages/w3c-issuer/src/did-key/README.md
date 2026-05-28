# Using `did:key`

This guide explains how to issue and use a Decentralized Identifier (DID) with the [`did:key`](https://w3c-ccg.github.io/did-key-spec/) method. Unlike `did:web`, `did:key` is **self-certifying** — the public key is encoded directly into the DID itself, so no hosting infrastructure is required.

## Table of Contents

- 1. [How it differs from `did:web`](#how-it-differs-from-didweb)
- 2. [Trust model](#trust-model)
- 3. [Supported key types](#supported-key-types)
- 4. [Step-by-Step Usage](#step-by-step-usage)
  - 1. [Generate a `did:key` Key Pair](#1-generate-a-didkey-key-pair)
  - 2. [Sign a Credential](#2-sign-a-credential)
  - 3. [Verify a Credential](#3-verify-a-credential)
- 5. [Anatomy of a `did:key` DID](#anatomy-of-a-didkey-did)
- 6. [Specifications](#specifications)

## How it differs from `did:web`

| | `did:web` | `did:key` |
|---|---|---|
| Hosting required | Yes (a `.well-known/did.json` or similar) | **No** |
| Verifier needs network | Yes (to fetch the DID document) | **No** (DID document is synthesised in memory) |
| Human-readable identifier | Yes (domain name in DID) | No (the DID is the encoded public key) |
| Multiple keys per DID | Yes | No (exactly one key per DID) |
| Key rotation | Update hosted document, DID stays the same | DID changes — a new key is a new DID |
| Revocation by removal | Yes (take the doc down, remove the VM) | Not possible — anyone with the key can keep signing |
| Trust anchor | The domain | **Must be supplied out-of-band** (see below) |

Example identifiers:

```
did:web:trustvc.github.io:did:1                          ← did:web (resolves via HTTPS)
did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc ← did:key (resolves locally)
```

## Trust model

Cryptographically, a `did:key`-signed credential proves *the holder of this private key signed this credential*. That part is identical to `did:web` — same crypto, same guarantees.

What `did:key` does **not** give you on its own is *who* in the real world holds that private key. With `did:web`, the domain answers that question (you trust whoever controls `trustvc.github.io`). With `did:key`, the DID is just a number and you need to bind it to a real-world entity through one of:

1. **Trust registry / allow-list** — maintain a list of approved `did:key` DIDs out-of-band. The verifier checks the credential's issuer against the registry.
2. **Chained credentials (delegation)** — a known authority (often a `did:web` issuer) issues a credential **to** a `did:key` saying "this key is authorised to act on behalf of X". The verifier walks the chain.
3. **Sidechannel exchange** — exchange the `did:key` through a trusted channel (business card, contract, signed email, etc.).
4. **Self-contained credentials** — for use cases where the credential proves a property of itself (a hash, a receipt) and issuer identity is not relevant.

If you are using `did:key` in production for regulated contexts (Bills of Lading, KYC, etc.), do **not** rely on the cryptographic identity check alone — layer one of the patterns above in your application code.

## Supported key types

This library supports two `did:key` key types, chosen to match the cryptosuites available in `@trustvc/w3c-vc`:

| Multibase prefix | Key type | Multicodec | Cryptosuite |
|---|---|---|---|
| `zDna...` | P-256 (NIST secp256r1, compressed) | `0x1200` | `ecdsa-sd-2023` |
| `zUC7...` | BLS12-381 G2 | `0xeb` | `bbs-2023` |

Other `did:key` types defined in the method spec (Ed25519 `z6Mk...`, secp256k1 `zQ3s...`, P-384, P-521, RSA, etc.) are rejected at parse time with a clear error, because no matching cryptosuite is wired up in `@trustvc/w3c-vc`.

## Step-by-Step Usage

### 1. Generate a `did:key` Key Pair

```ts
import { CryptoSuite, generateDidKeyPair } from '@trustvc/w3c-issuer';

const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
// did is: 'did:key:zDna...'
// didKeyPairs is a Multikey private key pair (id/controller/publicKeyMultibase/secretKeyMultibase)
```

Keep `didKeyPairs.secretKeyMultibase` private — it is what allows you to sign as this DID. The other fields (`did`, `publicKeyMultibase`) are safe to publish.

For BBS-2023 you may pass an optional `seedBase58` if you want deterministic generation:

```ts
const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.Bbs2023, {
  seedBase58: 'FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN',
});
```

ECDSA-SD-2023 does not support seeded generation.

### 2. Sign a Credential

The signing call is identical to `did:web` — pass the key pair to `signCredential` from `@trustvc/w3c-vc`. The resulting proof's `verificationMethod` references the canonical `did:key:zXxx#zXxx` form:

```ts
import { signCredential } from '@trustvc/w3c-vc';

const credential = {
  '@context': ['https://www.w3.org/ns/credentials/v2', 'https://w3id.org/security/data-integrity/v2'],
  type: ['VerifiableCredential'],
  issuer: did, // the did:key from above
  validFrom: '2024-04-01T12:19:52Z',
  credentialSubject: { name: 'TrustVC Demo' },
};

const { signed } = await signCredential(credential, didKeyPairs, 'ecdsa-sd-2023');
```

### 3. Verify a Credential

`verifyCredential` works without any extra configuration — the default document loader from `@trustvc/w3c-context` automatically dispatches `did:key:*` resolution through this package's `queryDidDocument`, which synthesises the DID document in memory. No network call is made.

```ts
import { deriveCredential, verifyCredential } from '@trustvc/w3c-vc';

// ECDSA-SD-2023 and BBS-2023 are selective-disclosure schemes: derive before verifying.
const { derived } = await deriveCredential(signed, ['/credentialSubject/name']);
const result = await verifyCredential(derived);
// result.verified === true
```

## Anatomy of a `did:key` DID

A `did:key` DID is constructed as:

```
did:key: + z + base58btc( <multicodec varint> || <public key bytes> )
```

Worked example for the P-256 key `zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc`:

```
did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc
        │
        └── z = base58btc multibase prefix
            ── decode base58btc → [0x80, 0x24, ...33 bytes pubkey]
                                  └──┬───┘ └──────┬────────┘
                                varint(0x1200)   raw compressed P-256 public key
                                = "p256-pub"
```

The synthesised DID document has exactly one verification method, whose `id` is `<did>#<multibase>` (the fragment **must** equal the multibase identifier per the did:key spec):

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1"
  ],
  "id": "did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc",
  "verificationMethod": [{
    "id": "did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc#zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc",
    "type": "Multikey",
    "controller": "did:key:zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc",
    "publicKeyMultibase": "zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc"
  }],
  "authentication": ["did:key:zDnae...#zDnae..."],
  "assertionMethod": ["did:key:zDnae...#zDnae..."],
  "capabilityInvocation": ["did:key:zDnae...#zDnae..."],
  "capabilityDelegation": ["did:key:zDnae...#zDnae..."]
}
```

## Specifications

- [DID Core 1.0](https://www.w3.org/TR/did-core/) — DID and verification method data model.
- [The `did:key` Method v0.9](https://w3c-ccg.github.io/did-key-spec/) — encoding rules and canonical fragment form.
- [VC Data Integrity 1.0](https://www.w3.org/TR/vc-data-integrity/) — `DataIntegrityProof` and `verificationMethod` requirements.
- [W3C Data Integrity ECDSA Cryptosuites](https://www.w3.org/TR/vc-di-ecdsa/) — `ecdsa-sd-2023`, P-256 binding.
- [W3C Data Integrity BBS Cryptosuites](https://www.w3.org/TR/vc-di-bbs/) — `bbs-2023`, BLS12-381 G2 binding.
- [Multicodec table](https://github.com/multiformats/multicodec/blob/master/table.csv) — multicodec code points.
