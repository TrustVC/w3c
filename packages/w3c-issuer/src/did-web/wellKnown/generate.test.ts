import _ from 'lodash';
import { beforeEach, describe, expect, it } from 'vitest';
import { VerificationContext, VerificationType } from '../../lib/types';
import { generateWellKnownDid, nextKeyId } from './generate';
import { DidWellKnownDocument } from './types';

describe('generate', () => {
  const seedBase58 = 'CxBwAH4ftdc9XkLhw7DkFAESxh3NEdetMyJXKrPiAKAX';
  const privateKeyBase58 = '7e1VnFeqvMjqoq61qhGE2dgnQmgNDAYEX1FGzwywf2h7';
  const publicKeyBase58 =
    '23GznFBm8BZcPM2BX7tcPfmeCAfkKKLWUWYwAj1jnu8acYhaNB892YkCDCJ1LLhXRBDpXEigx2tQYaw6EP1e1Fia83AfRUnmSA35v96ZgU3PmEd2DGqhUAXZZa4rM1gVGB9v';
  let wellKnown: DidWellKnownDocument;
  const constWellKnown: DidWellKnownDocument = {
    id: 'did:web:localhost.com',
    verificationMethod: [
      {
        type: 'Bls12381G2Key2020',
        id: 'did:web:localhost.com#keys-1',
        controller: 'did:web:localhost.com',
        publicKeyBase58:
          'yeFTpcEiuHVwhWuBfkKfuS6UVowJciCxTL7meFXjhu1vUAk1yYf8FbTk3BjiBgiyHXasTgznidM6WTSzxBYhXwfqEGbFSZToVxbhTQ1A1HYcnUuiocFgTAoyfCvbAhijdwx',
      },
      {
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        id: 'did:web:localhost.com#keys-2',
        controller: 'did:web:localhost.com',
        blockchainAccountId: '0xcDFAcbb428DD30ddf6d99875dcad04CbEFcd6E60',
      },
    ],
    '@context': [
      'https://www.w3.org/ns/did/v1',
      VerificationContext[VerificationType.Bls12381G2Key2020],
      VerificationContext[VerificationType.EcdsaSecp256k1RecoveryMethod2020],
    ],
    assertionMethod: ['did:web:localhost.com#keys-1', 'did:web:localhost.com#keys-2'],
    authentication: ['did:web:localhost.com#keys-1', 'did:web:localhost.com#keys-2'],
    capabilityInvocation: ['did:web:localhost.com#keys-1', 'did:web:localhost.com#keys-2'],
    capabilityDelegation: ['did:web:localhost.com#keys-1', 'did:web:localhost.com#keys-2'],
  } as const;

  beforeEach(() => {
    wellKnown = _.cloneDeep(constWellKnown);
  });

  describe('generateWellKnownDid', () => {
    it('should fail to generateWellKnownDid without any input', () => {
      const result = generateWellKnownDid({} as any);
      expect(result).toBeFalsy();
    });

    describe('generateWellKnownDid - Bls12381', () => {
      const keyPair = {
        id: 'did:web:localhost.com#keys-3',
        type: VerificationType.Bls12381G2Key2020,
        controller: 'did:web:localhost.com',
        seedBase58,
        privateKeyBase58,
        publicKeyBase58,
      };
      const verificationMethod = _.omit(keyPair, ['seedBase58', 'privateKeyBase58']);
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
        expect(result?.['@context']).toContain(VerificationContext[keyPair.type]);
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
        expect(result?.verificationMethod?.[result?.verificationMethod?.length - 1]).toMatchObject(
          verificationMethod,
        );
        expect(result?.['@context']).toContain('https://www.w3.org/ns/did/v1');
        expect(result?.['@context']).toContain(VerificationContext[keyPair.type]);
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
        expect(result?.['@context']).toContain(VerificationContext[keyPair.type]);
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
        expect(result?.verificationMethod?.[result?.verificationMethod?.length - 1]).toMatchObject(
          verificationMethod,
        );
        expect(result?.['@context']).toContain('https://www.w3.org/ns/did/v1');
        expect(result?.['@context']).toContain(VerificationContext[keyPair.type]);
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
          publicKeyBase58: wellKnown.verificationMethod?.[0].publicKeyBase58,
        };
        expect(() =>
          generateWellKnownDid({
            wellKnown: wellKnown,
            newKeyPair: duplicatedKeyPair,
          }),
        ).toThrowError('KeyPair already exists');
      });
    });

    describe('generateWellKnownDid - EcdsaSecp256k1RecoveryMethod2020', () => {
      const keyPair = {
        id: 'did:web:localhost.com#keys-3',
        type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
        controller: 'did:web:localhost.com',
        mnemonics: 'indicate swing place chair flight used hammer soon photo region volume shuffle',
        path: "m/44'/60'/0'/0/0",
        blockchainAccountId: '0xe0A71284EF59483795053266CB796B65E48B5124',
        privateKeyHex: '0xe82294532bcfcd8e0763ee5cef194f36f00396be59b94fb418f5f8d83140d9a7',
      };
      const verificationMethod = _.omit(keyPair, ['mnemonics', 'path', 'privateKeyHex']);

      it('should generateWellKnownDid with keyPair - EcdsaSecp256k1RecoveryMethod2020', async () => {
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
        expect(result?.['@context']).toContain(VerificationContext[keyPair.type]);
      });

      it('should fail to generateWellKnownDid with same blockchainAccountId as wellKnown - EcdsaSecp256k1RecoveryMethod2020', async () => {
        const duplicatedKeyPair = {
          ...keyPair,
          path: "m/44'/60'/0'/0/1",
          blockchainAccountId: wellKnown.verificationMethod?.[1].blockchainAccountId,
        };

        expect(() =>
          generateWellKnownDid({
            wellKnown: wellKnown,
            newKeyPair: duplicatedKeyPair,
          }),
        ).toThrowError('KeyPair already exists');
      });
    });
  });

  describe('nextKeyId', () => {
    it('should return next keyId', () => {
      const nextId = nextKeyId(wellKnown);

      expect(nextId).toBe(3);
    });
  });
});
