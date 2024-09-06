# Self-hosting a `did:web`

This guide explains how to self-host a Decentralized Identifier (DID) using the `did:web` method. The `did:web` method allows you to create a DID linked to a domain you control, enabling decentralized identity services hosted on your website.

## Table of Contents

- 1. [Prerequisites](#prerequisites)
- 2. [Step-by-Step Setup](#step-by-step-setup)
  - 1. [Generate DID Document](#1-generate-did-document)
  - 2. [Host DID Document](#2-host-did-document)
- 3. [Verifying Your did:web](#verifying-your-didweb)
- 4. [Best Practices](#best-practices)
- 5. [Troubleshooting](#troubleshooting)

## Prerequisites

- **A domain name**: You need access to a domain name where you can host static content.
- **Web hosting**: Ensure you have the ability to host static files on your domain. This can be done via any web hosting service that supports serving static JSON files (e.g., GitHub Pages, Netlify, your own web server).
- **Tools**: Familiarity with basic command-line tools and JSON structure is helpful.

## Step-by-Step Setup
### 1. Generate DID Document
- **Use `TrustVC W3C Issuer` to generate your DID Document**: Our tool simplifies the process of creating a compliant DID Document. 
- **Review your DID Document**: Ensure the generated file contains the required properties, such as `id`, `verificationMethod`, and `authentication`. Here's an example using the `BbsBlsSignature2020` verification method:
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:web:yourdomain.com",
  "verificationMethod": [{
    "id": "did:web:yourdomain.com#key-1",
    "type": "BbsBlsSignature2020",
    "controller": "did:web:yourdomain.com",
    "publicKeyBase58": "2qz8jVcPgs6xzL5mZHTZGkXQaDe5BsVofLpqqBfAw1Nc"
  }],
  "authentication": [
    "did:web:yourdomain.com#key-1"
  ]
}

```
- **Save the document** as `did.json`.
### 2. Host DID Document
1. **Determine your DID URL**: For a domain like `example.com`, the DID Document needs to be accessible at the URL `https://example.com/.well-known/did.json`.

2. **Upload the DID Document**:
- Ensure the file is accessible at `https://yourdomain.com/.well-known/did.json`.
- Test by visiting the URL directly in your browser to ensure the file is being served correctly.

### Example using GitHub Pages
If you’re hosting the DID document on GitHub Pages:

1. Create a repository with the structure:
```sh
.well-known/
   did.json
```
2. Push the repository to GitHub and enable GitHub Pages for the repository.
3. Your DID document should be accessible at `https://yourusername.github.io/.well-known/did.json`.

## Verifying Your `did:web`
To verify that your DID Document is properly hosted:
1. Use a DID resolver like [Universal Resolver](https://dev.uniresolver.io/) to check that your DID can be resolved.
2. Verify that your DID Document conforms to the DID specification.

## Best Practices
- **HTTPS**: Ensure your site uses HTTPS, as DID documents must be served over secure connections.
- **Versioning**: Maintain version control of your DID document to track any changes.
- **Security**: Protect private keys associated with the DID Document. Only publish public keys in the did.json file.

## Troubleshooting
- **File Not Found Error**: Double-check the file path and ensure your web hosting service is correctly serving static files.
- **DID Not Resolving**: Verify that your DNS is properly configured, and the DID Document is correctly formatted.
