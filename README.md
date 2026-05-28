# TrustVC W3C

## About

A wrapper library built for TrustVC to work with W3C [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) (VCs) Data Model v1.1 and [v2.0](https://www.w3.org/TR/vc-data-model-2.0/). Provides packages to facilitate the creation of [Decentralized Identifiers](https://www.w3.org/TR/did-core/) (DIDs) v1, supporting both [`did:web`](https://w3c-ccg.github.io/did-method-web/) (host a DID document) and [`did:key`](https://w3c-ccg.github.io/did-key-spec/) (self-certifying, no hosting required), and Verifiable Credentials Status — both [Status List 2021](https://www.w3.org/TR/2023/WD-vc-status-list-20230427/) and the latest [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/).

## Packages

For more details on each packages, refer to the individual README doc.

| Packages                                                                                                  | npm                                                                 |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [@trustvc/w3c](https://github.com/TrustVC/w3c/tree/main/packages/w3c)                                     | [npm](https://www.npmjs.com/package/@trustvc/w3c)                   |
| [@trustvc/w3c-context](https://github.com/TrustVC/w3c/tree/main/packages/w3c-context)                     | [npm](https://www.npmjs.com/package/@trustvc/w3c-context)           |
| [@trustvc/w3c-credential-status](https://github.com/TrustVC/w3c/tree/main/packages/w3c-credential-status) | [npm](https://www.npmjs.com/package/@trustvc/w3c-credential-status) |
| [@trustvc/w3c-issuer](https://github.com/TrustVC/w3c/tree/main/packages/w3c-issuer)                       | [npm](https://www.npmjs.com/package/@trustvc/w3c-issuer)            |
| [@trustvc/w3c-vc](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc)                               | [npm](https://www.npmjs.com/package/@trustvc/w3c-vc)                |

## Getting Started

1. **Pre Requisite**

   1. Generate a signature specific key pair. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-issuer#1-create-private-key)
   2. Choose a DID method:
      - `did:web` — generate a DID document and host it on a domain you control. [did:web setup guide](https://github.com/TrustVC/w3c/tree/main/packages/w3c-issuer#2-generate-did-key-pair-and-did-document)
      - `did:key` — generate a self-certifying DID key pair (no hosting required). [did:key setup guide](https://github.com/TrustVC/w3c/tree/main/packages/w3c-issuer#3-generate-a-didkey-key-pair)

2. **Sign and Verify VC**

   1. Sign
      1. Prepare and Sign the VC payload. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc#1-signing-a-credential)
   2. Verify
      1. Verify the signed VC. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc#2-verifying-a-credential)

3. **Sign and Verify VC with Credential Status**
   1. Generate Credential Status
      1. Prepare and Sign the payload for Credential Status. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-credential-status#w3c-credential-status)
   2. Sign
      1. Prepare and Sign the VC payload. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc#1-signing-a-credential)
   3. Verify
      1. Verify the signed VC. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc#2-verifying-a-credential)
      2. Verify the credentialStatus [link]()

## Running the code

```
npm install
npm run build
npm run test
```
