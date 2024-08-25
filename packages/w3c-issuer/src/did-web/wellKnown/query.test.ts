import { describe, expect, it } from 'vitest';
import { queryWellKnownDid } from './query';

describe('query', () => {
  describe('queryWellKnownDid', () => {
    it('should fail to queryWellKnownDid without any input', async () => {
      await expect(queryWellKnownDid('')).rejects.toThrowError('Invalid / Missing domain');
    });

    it('should fail to queryWellKnownDid with invalid did', async () => {
      await expect(queryWellKnownDid('invalidDomain')).rejects.toThrowError(
        'Invalid / Missing domain',
      );
    });

    it('should queryWellKnownDid with valid did', async () => {
      const domain = 'https://www.google.com';
      const { did, wellKnownDid } = await queryWellKnownDid(domain);
      expect(wellKnownDid).toBe(null);
      expect(did).toBe('did:web:www.google.com');
    });

    // TODO: NEED TO BE UPDATED WITH TRUST-VC DID GITHUB PAGES, REPLACING NGHANINN.COM
    it('should queryWellKnownDid with valid did', async () => {
      const domain = 'https://nghaninn.github.io/did/1';
      const { did, wellKnownDid } = await queryWellKnownDid(domain);
      expect(wellKnownDid).toMatchInlineSnapshot(`
        {
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/bls12381-2020/v1",
          ],
          "assertionMethod": [
            "did:web:nghaninn.github.io:did:1#keys-1",
          ],
          "authentication": [
            "did:web:nghaninn.github.io:did:1#keys-1",
          ],
          "capabilityDelegation": [
            "did:web:nghaninn.github.io:did:1#keys-1",
          ],
          "capabilityInvocation": [
            "did:web:nghaninn.github.io:did:1#keys-1",
          ],
          "id": "did:web:nghaninn.github.io:did:1",
          "verificationMethod": [
            {
              "controller": "did:web:nghaninn.github.io:did:1",
              "id": "did:web:nghaninn.github.io:did:1#keys-1",
              "publicKeyBase58": "rDAqEpT2FJspbHL9gM1utkT2UNADn59HMiouSLoktZw8B1GsKyXB3Wd5fgDucCbMDRLcQhWHEuQrrKSf7P2NyqgFwHGbzNQ9X8EPbXakSr2cbqLghmzkGvE4ppEHVkBYc83",
              "type": "Bls12381G2Key2020",
            },
          ],
        }
      `);
      expect(did).toBe('did:web:nghaninn.github.io:did:1');
    });
  });
});
