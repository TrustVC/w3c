import { omit } from 'lodash';
import { beforeEach, describe, expect, it } from 'vitest';
import { generateWellKnownDid, nextKeyId } from './generate';

describe('generate', () => {
  const seedBase58 = 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX';
  const privateKeyBase58 = '7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7';
  const publicKeyBase58 =
    '23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v';
  let wellKnown = {
    id: 'did:web:localhost.com',
    verificationMethod: [
      {
        type: 'Bls12381G2Key2020',
        id: 'did:web:localhost.com#keys-1',
        controller: 'did:web:localhost.com',
        publicKeyBase58:
          'yeFTpcEiuHVwhWuBfkKfuS6UVowJciCxTL7meFXjhu1vUAk1yYf8FbTk3BjiBgiyHXasTgznidM6WTSzxBYhXwfqEGbFSZToVxbhTQ1A1HYcnUuiocFgTAoyfCvbAhijdwx',
      },
    ],
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/bls12381-2020/v1',
    ],
    assertionMethod: ['did:web:localhost.com#keys-1'],
    authentication: ['did:web:localhost.com#keys-1'],
    capabilityInvocation: ['did:web:localhost.com#keys-1'],
    capabilityDelegation: ['did:web:localhost.com#keys-1'],
  };
  const keyPair = {
    id: 'did:web:localhost.com#keys-2',
    type: 'Bls12381G2Key2020',
    controller: 'did:web:localhost.com',
    seedBase58,
    privateKeyBase58,
    publicKeyBase58,
  };

  beforeEach(() => {
    wellKnown = {
      id: 'did:web:localhost.com',
      verificationMethod: [
        {
          type: 'Bls12381G2Key2020',
          id: 'did:web:localhost.com#keys-1',
          controller: 'did:web:localhost.com',
          publicKeyBase58:
            'yeFTpcEiuHVwhWuBfkKfuS6UVowJciCxTL7meFXjhu1vUAk1yYf8FbTk3BjiBgiyHXasTgznidM6WTSzxBYhXwfqEGbFSZToVxbhTQ1A1HYcnUuiocFgTAoyfCvbAhijdwx',
        },
      ],
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/bls12381-2020/v1',
      ],
      assertionMethod: ['did:web:localhost.com#keys-1'],
      authentication: ['did:web:localhost.com#keys-1'],
      capabilityInvocation: ['did:web:localhost.com#keys-1'],
      capabilityDelegation: ['did:web:localhost.com#keys-1'],
    };
  });

  describe('generateWellKnownDid', () => {
    const verificationMethod = omit(keyPair, ['seedBase58', 'privateKeyBase58']);
    it('should fail to generateWellKnownDid without any input', () => {
      const result = generateWellKnownDid({} as any);
      expect(result).toBeFalsy();
    });

    it('should generateWellKnownDid with keyPair - Bls12381', async () => {
      const result = generateWellKnownDid({
        newKeyPair: keyPair,
      });

      expect(result).toBeTruthy();
      expect(result?.id).toBe(keyPair.controller);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('verificationMethod');
      expect(result).toHaveProperty('@context');
      expect(result).toHaveProperty('assertionMethod');
      expect(result).toHaveProperty('authentication');
      expect(result).toHaveProperty('capabilityInvocation');
      expect(result).toHaveProperty('capabilityDelegation');
      expect(result?.verificationMethod?.[0]).toMatchObject(verificationMethod);
      expect(result?.['@context']).toContain('https://www.w3.org/ns/did/v1');
      expect(result?.['@context']).toContain('https://w3id.org/security/suites/bls12381-2020/v1');
    });

    it('should generateWellKnownDid with keyPair and wellKnown - Bls12381', async () => {
      const result = generateWellKnownDid({
        wellKnown: wellKnown,
        newKeyPair: keyPair,
      });

      expect(result).toBeTruthy();
      expect(result?.id).toBe(keyPair.controller);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('verificationMethod');
      expect(result).toHaveProperty('@context');
      expect(result).toHaveProperty('assertionMethod');
      expect(result).toHaveProperty('authentication');
      expect(result).toHaveProperty('capabilityInvocation');
      expect(result).toHaveProperty('capabilityDelegation');
      expect(result?.verificationMethod?.[1]).toMatchObject(verificationMethod);
      expect(result?.['@context']).toContain('https://www.w3.org/ns/did/v1');
      expect(result?.['@context']).toContain('https://w3id.org/security/suites/bls12381-2020/v1');
    });

    it('should generateWellKnownDid with keyPair and empty wellKnown object - Bls12381', async () => {
      const result = generateWellKnownDid({
        wellKnown: {} as any,
        newKeyPair: keyPair,
      });

      expect(result).toBeTruthy();
      expect(result?.id).toBe(keyPair.controller);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('verificationMethod');
      expect(result).toHaveProperty('@context');
      expect(result).toHaveProperty('assertionMethod');
      expect(result).toHaveProperty('authentication');
      expect(result).toHaveProperty('capabilityInvocation');
      expect(result).toHaveProperty('capabilityDelegation');
      expect(result?.verificationMethod?.[0]).toMatchObject(verificationMethod);
      expect(result?.['@context']).toContain('https://www.w3.org/ns/did/v1');
      expect(result?.['@context']).toContain('https://w3id.org/security/suites/bls12381-2020/v1');
    });

    it('should generateWellKnownDid with keyPair and wellKnown, @context containing only string - Bls12381', async () => {
      const result = generateWellKnownDid({
        wellKnown: {
          ...wellKnown,
          '@context': 'https://www.w3.org/ns/did/v1',
        },
        newKeyPair: keyPair,
      });

      expect(result).toBeTruthy();
      expect(result?.id).toBe(keyPair.controller);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('verificationMethod');
      expect(result).toHaveProperty('@context');
      expect(result).toHaveProperty('assertionMethod');
      expect(result).toHaveProperty('authentication');
      expect(result).toHaveProperty('capabilityInvocation');
      expect(result).toHaveProperty('capabilityDelegation');
      expect(result?.verificationMethod?.[1]).toMatchObject(verificationMethod);
      expect(result?.['@context']).toContain('https://www.w3.org/ns/did/v1');
      expect(result?.['@context']).toContain('https://w3id.org/security/suites/bls12381-2020/v1');
    });

    it('should fail to generateWellKnownDid with same keyPair id and wellKnown - Bls12381', async () => {
      const duplicatedKeyPair = {
        ...keyPair,
        id: 'did:web:localhost.com#keys-1',
      };
      expect(() =>
        generateWellKnownDid({
          wellKnown: wellKnown,
          newKeyPair: duplicatedKeyPair,
        }),
      ).toThrowError('Key already exists');
    });

    it('should fail to generateWellKnownDid with same publicKey as wellKnown - Bls12381', async () => {
      const duplicatedKeyPair = {
        ...keyPair,
        publicKeyBase58: wellKnown.verificationMethod[0].publicKeyBase58,
      };
      expect(() =>
        generateWellKnownDid({
          wellKnown: wellKnown,
          newKeyPair: duplicatedKeyPair,
        }),
      ).toThrowError('Public key already exists');
    });
  });

  describe('nextKeyId', () => {
    it('should return next keyId', () => {
      const nextId = nextKeyId(wellKnown);

      expect(nextId).toBe(2);
    });
  });
});
