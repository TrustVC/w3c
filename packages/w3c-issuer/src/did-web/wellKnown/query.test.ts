import { describe, expect, it } from 'vitest';
import { queryDidDocument, resolve, resolveRepresentation, dereference } from './query';

describe('query', () => {
  describe('queryDidDocument', () => {
    it('should fail to queryDidDocument without any input', async () => {
      await expect(queryDidDocument({ domain: '' })).rejects.toThrowError('Missing domain');
    });

    it('should fail to queryDidDocument with invalid did', async () => {
      await expect(queryDidDocument({ domain: 'invalidDomain' })).rejects.toThrowError(
        'Invalid domain',
      );
    });

    it('should queryDidDocument with valid did', async () => {
      const domain = 'https://www.google.com';
      const { did, wellKnownDid } = await queryDidDocument({ domain });
      expect(wellKnownDid).toBe(null);
      expect(did).toBe('did:web:www.google.com');
    });

    it('should queryDidDocument with valid did', async () => {
      const domain = 'https://trustvc.github.io/did/1';
      const { did, wellKnownDid } = await queryDidDocument({ domain });
      expect(wellKnownDid).toMatchInlineSnapshot(`
        {
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/bls12381-2020/v1",
            "https://w3id.org/security/multikey/v1",
          ],
          "assertionMethod": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "authentication": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "capabilityDelegation": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "capabilityInvocation": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "id": "did:web:trustvc.github.io:did:1",
          "verificationMethod": [
            {
              "controller": "did:web:trustvc.github.io:did:1",
              "id": "did:web:trustvc.github.io:did:1#keys-1",
              "publicKeyBase58": "oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ",
              "type": "Bls12381G2Key2020",
            },
            {
              "controller": "did:web:trustvc.github.io:did:1",
              "id": "did:web:trustvc.github.io:did:1#multikey-1",
              "publicKeyMultibase": "zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc",
              "type": "Multikey",
            },
            {
              "controller": "did:web:trustvc.github.io:did:1",
              "id": "did:web:trustvc.github.io:did:1#multikey-2",
              "publicKeyMultibase": "zUC7HnpncVAkTjtL6B8prX6bQM2WA5sJ7rXFeCqyrvPnrzoFBjYsVUTNwzhhPUazja73tWwPeEBWCUgq5qBSrtrXiYhVvBCgZPTCiWANj7TSiZJ6SnyC3pkt94GiuChhAvmRRbt",
              "type": "Multikey",
            },
          ],
        }
      `);
      expect(did).toBe('did:web:trustvc.github.io:did:1');
    });
  });

  describe('resolve', () => {
    it('should resolve did', async () => {
      const did = 'did:web:trustvc.github.io:did:1';
      const result = await resolve(did);
      expect(result.didDocument).toMatchInlineSnapshot(`
        {
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/bls12381-2020/v1",
            "https://w3id.org/security/multikey/v1",
          ],
          "assertionMethod": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "authentication": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "capabilityDelegation": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "capabilityInvocation": [
            "did:web:trustvc.github.io:did:1#keys-1",
            "did:web:trustvc.github.io:did:1#multikey-1",
            "did:web:trustvc.github.io:did:1#multikey-2",
          ],
          "id": "did:web:trustvc.github.io:did:1",
          "verificationMethod": [
            {
              "controller": "did:web:trustvc.github.io:did:1",
              "id": "did:web:trustvc.github.io:did:1#keys-1",
              "publicKeyBase58": "oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ",
              "type": "Bls12381G2Key2020",
            },
            {
              "controller": "did:web:trustvc.github.io:did:1",
              "id": "did:web:trustvc.github.io:did:1#multikey-1",
              "publicKeyMultibase": "zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc",
              "type": "Multikey",
            },
            {
              "controller": "did:web:trustvc.github.io:did:1",
              "id": "did:web:trustvc.github.io:did:1#multikey-2",
              "publicKeyMultibase": "zUC7HnpncVAkTjtL6B8prX6bQM2WA5sJ7rXFeCqyrvPnrzoFBjYsVUTNwzhhPUazja73tWwPeEBWCUgq5qBSrtrXiYhVvBCgZPTCiWANj7TSiZJ6SnyC3pkt94GiuChhAvmRRbt",
              "type": "Multikey",
            },
          ],
        }
      `);
    });

    it('should return notFound error for unresolvable did', async () => {
      const did = 'did:web:trustvc2.github.io:did:1';
      const result = await resolve(did);
      expect(result.didDocument).toBeNull();
      expect(result.didResolutionMetadata).toHaveProperty('error', 'notFound');
    });

    it('should return inValidDid error for invalid did', async () => {
      const did = 'did:web: trustvc .github.io:did:1';
      const result = await resolve(did);
      expect(result.didDocument).toBeNull();
      expect(result.didResolutionMetadata).toHaveProperty('error', 'invalidDid');
    });
  });

  describe('resolveRepresentation', () => {
    it('Should return serialized data for valid did and should contain contentType', async () => {
      const did = 'did:web:trustvc.github.io:did:1';
      const result = await resolveRepresentation(did);

      expect(result.didDocumentStream).toBeTruthy();
      expect(typeof result.didDocumentStream).toBe('string');
      const parsedDocument = JSON.parse(result.didDocumentStream);
      expect(parsedDocument).toHaveProperty('@context');
      expect(result.didResolutionMetadata).toHaveProperty('contentType', 'application/did+ld+json');
    });

    it('Should return correct contentType for requested accept value', async () => {
      const did = 'did:web:trustvc.github.io:did:1';
      const result = await resolveRepresentation(did, { accept: 'application/did+json' });

      expect(result.didDocumentStream).toBeTruthy();
      expect(typeof result.didDocumentStream).toBe('string');
      const parsedDocument = JSON.parse(result.didDocumentStream);
      expect(parsedDocument).not.toHaveProperty('@context');
      expect(result.didResolutionMetadata).toHaveProperty('contentType', 'application/did+json');
    });

    it('Should return representationNotSupported error for unsupported accept value', async () => {
      const did = 'did:web:trustvc.github.io:did:1';
      const result = await resolveRepresentation(did, { accept: 'application/did+cbor' });

      expect(result).toEqual({
        didResolutionMetadata: {
          error: 'representationNotSupported',
          message: 'Content type application/did+cbor is not supported.',
        },
        didDocumentStream: '',
        didDocumentMetadata: {},
      });
    });
  });
});

describe('dereference', () => {
  it('Should return serialized data for valid did', async () => {
    const did = 'did:web:trustvc.github.io:did:1';
    const result = await dereference(did);

    expect(result.contentStream).toBeTruthy();
    expect(typeof result.contentStream).toBe('string');
    const parsedDocument = JSON.parse(result.contentStream);
    expect(parsedDocument).toHaveProperty('@context');
    expect(result.dereferencingMetadata).toHaveProperty('contentType', 'application/did+ld+json');
  });

  it('Should return valid verification method for a given fragment', async () => {
    const did = 'did:web:trustvc.github.io:did:1#multikey-1';
    const result = await dereference(did);

    expect(result.contentStream).toBe(
      '{"id":"did:web:trustvc.github.io:did:1#multikey-1","type":"Multikey","controller":"did:web:trustvc.github.io:did:1","publicKeyMultibase":"zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc"}',
    );
    expect(result.dereferencingMetadata).toHaveProperty('contentType', 'application/did+ld+json');
  });

  it('Should return notFound for query or path based dereferencing', async () => {
    const didWithPath = 'did:web:trustvc.github.io:did:1/path';
    const resultWithPath = await dereference(didWithPath);
    expect(resultWithPath.dereferencingMetadata).toHaveProperty('error', 'notFound');
    expect(resultWithPath.contentStream).toBe('');

    const didWithQuery = 'did:web:trustvc.github.io:did:1?query=param';
    const resultWithQuery = await dereference(didWithQuery);
    expect(resultWithQuery.dereferencingMetadata).toHaveProperty('error', 'notFound');
    expect(resultWithQuery.contentStream).toBe('');
  });
});
