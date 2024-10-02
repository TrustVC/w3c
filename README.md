# TrustVC W3C

## About
A wrapper lib build for TrustVC to work with W3C [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) (VCs) Data Model v1.1. Provides packages to facilitate the creation of [Decentralized Identifiers](https://www.w3.org/TR/did-core/) (DIDs) v1, specifically [`did:web`](https://w3c-ccg.github.io/did-method-web/), and [Verifiable Credentials Status](https://www.w3.org/TR/2023/WD-vc-status-list-20230427/) Status List v2021.

## Packages
For more details on each packages, refer to the individual README doc.

| Packages | npm |
| --- | --- |
| [@trustvc/w3c](https://github.com/TrustVC/w3c/tree/main/packages/w3c) | [npm](https://www.npmjs.com/package/@trustvc/w3c) |
| [@trustvc/w3c-context](https://github.com/TrustVC/w3c/tree/main/packages/w3c-context) | [npm](https://www.npmjs.com/package/@trustvc/w3c-context) |
| [@trustvc/w3c-credential-status](https://github.com/TrustVC/w3c/tree/main/packages/w3c-credential-status) | [npm](https://www.npmjs.com/package/@trustvc/w3c-credential-status) |
| [@trustvc/w3c-issuer](https://github.com/TrustVC/w3c/tree/main/packages/w3c-issuer) | [npm](https://www.npmjs.com/package/@trustvc/w3c-issuer) |
| [@trustvc/w3c-vc](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc) | [npm](https://www.npmjs.com/package/@trustvc/w3c-vc) |

## Tools
| Apps | Link |
| --- | --- |
| [@trustvc/w3c-cli](https://github.com/TrustVC/w3c/tree/main/apps/w3c-cli) | [npm](https://www.npmjs.com/package/@trustvc/w3c-cli) |

## Getting Started 

1. Pre Requisite
    1. Generate a signature specific key pair. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-issuer#1-create-private-key)

    2. Generate and host a DID web idenity. [link](https://github.com/TrustVC/w3c/tree/main/packagesw3c-issuer#2-generate-did-key-pair-and-did-document)
### 2. Sign and Verify VC

  #### 1. Sign
    1. Prepare and Sign the VC payload. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc#1-signing-a-credential)

  #### 2. Verify
    1. Verify the signed VC. [link](https://github.com/TradeTrust/w3c/tree/main/packages/w3c-vc#2-verifying-a-credential)

### 3. Sign and Verify VC with Credential Status

  #### 1. Generate Credential Status
    1. Preapre and Sign the paylaod for Credential Status. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-credential-status#w3c-credential-status)
    2. 
  #### 2. Sign
    1. Prepare and Sign the VC payload. [link](https://github.com/TrustVC/w3c/tree/main/packages/w3c-vc#1-signing-a-credential)
  #### 3. Verify
    1. Verify the signed VC. [link](https://github.com/TradeTrust/w3c/tree/main/packages/w3c-vc#2-verifying-a-credential)
    2. Verify the credentialStatus [link]()


## Running the code
```
npm install
npm run build
npm run test
```
