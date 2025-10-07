import {
  BBSPrivateKeyPair,
  EcdsaSd2023PrivateKeyPair,
  Bbs2023PrivateKeyPair,
  VerificationType,
} from '@trustvc/w3c-issuer';
import { describe, expect, it, vi } from 'vitest';
import { createCredentialStatusPayload } from './index';
import * as utils from './utils';
import { VC_V1_URL } from '@trustvc/w3c-context';

const BLS_KEY_PAIR: BBSPrivateKeyPair = {
  id: 'did:web:trustvc.github.io:did:1#keys-1',
  type: VerificationType.Bls12381G2Key2020,
  controller: 'did:web:trustvc.github.io:did:1',
  seedBase58: 'GWP69tmSWJjqC1RoJ27FehcVqkVyeYAz6h5ABwoNSNdS',
  privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
  publicKeyBase58:
    'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
};

const ECDSA_SD_KEY_PAIR: EcdsaSd2023PrivateKeyPair = {
  '@context': 'https://w3id.org/security/multikey/v1',
  id: 'did:web:trustvc.github.io:did:1#multikey-1',
  type: VerificationType.Multikey,
  controller: 'did:web:trustvc.github.io:did:1',
  publicKeyMultibase: 'zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc',
  secretKeyMultibase: 'z42tmUXTVn3n9BihE6NhdMpvVBTnFTgmb6fw18o5Ud6puhRW',
};

const BBS2023_KEY_PAIR: Bbs2023PrivateKeyPair = {
  '@context': 'https://w3id.org/security/multikey/v1',
  id: 'did:web:trustvc.github.io:did:1#multikey-2',
  type: VerificationType.Multikey,
  controller: 'did:web:trustvc.github.io:did:1',
  publicKeyMultibase:
    'zUC75kRac7BdtjawFUxowfgD6mzqnRHFxAfMDaBynebdYgakviQkPS1KNJEw7uGWqj91H3hSE4pTERb3EZKLgKXjpqHWrN8dyE8SKyPBE3k7kUGjBNAqJoNGgUzqUW3DSaWrcNr',
  secretKeyMultibase:
    'zrv1rbvMrsjWcLvfhAKhky5MwFMYoz9WdG9p7YGgUA3eL6z5U3owcX7Tk1P2MJseP8CnZ9AhUsj7HTKTrnB6FNkvEL2',
};

describe('w3c-credential-status', () => {
  describe('createCredentialStatusVC', () => {
    it('Should throw error when trying to create new VC with BLS cryptosuite', async () => {
      await expect(
        createCredentialStatusPayload(
          {
            id: 'https://example.com/credentials/3732',
            credentialSubject: {
              type: 'BitstringStatusList',
              id: 'https://example.com/credentials/status/3#list',
              statusPurpose: 'revocation',
              encodedList: 'encodedList',
            },
          },
          BLS_KEY_PAIR,
          'BitstringStatusListCredential',
          'BbsBlsSignature2020',
        ),
      ).rejects.toThrowError(
        'BbsBlsSignature2020 is no longer supported. Please use the latest cryptosuite versions instead.',
      );
    });

    it('should create a credential status VC with ECDSA-SD-2023 and v2.0 context', async () => {
      const credentialStatusPayload = await createCredentialStatusPayload(
        {
          id: 'https://example.com/credentials/3732',
          credentialSubject: {
            type: 'BitstringStatusList',
            id: 'https://example.com/credentials/status/3#list',
            statusPurpose: 'revocation',
            encodedList: 'encodedList',
          },
        },
        ECDSA_SD_KEY_PAIR,
        'BitstringStatusListCredential',
        'ecdsa-sd-2023',
      );

      expect(credentialStatusPayload).toMatchObject({
        '@context': [
          'https://www.w3.org/ns/credentials/v2',
          'https://w3id.org/security/data-integrity/v2',
        ],
        credentialSubject: {
          encodedList: 'encodedList',
          id: 'https://example.com/credentials/status/3#list',
          statusPurpose: 'revocation',
          type: 'BitstringStatusList',
        },
        issuer: 'did:web:trustvc.github.io:did:1',
        type: ['VerifiableCredential', 'BitstringStatusListCredential'],
        validFrom: expect.any(String),
      });

      // Explicitly verify that issuanceDate is not present in v2.0
      expect(credentialStatusPayload).not.toHaveProperty('issuanceDate');
    });

    it('should create a credential status VC with BBS-2023 and v2.0 context', async () => {
      const credentialStatusPayload = await createCredentialStatusPayload(
        {
          id: 'https://example.com/credentials/3732',
          credentialSubject: {
            type: 'BitstringStatusList',
            id: 'https://example.com/credentials/status/3#list',
            statusPurpose: 'revocation',
            encodedList: 'encodedList',
          },
        },
        BBS2023_KEY_PAIR,
        'BitstringStatusListCredential',
        'bbs-2023',
      );

      expect(credentialStatusPayload).toMatchObject({
        '@context': [
          'https://www.w3.org/ns/credentials/v2',
          'https://w3id.org/security/data-integrity/v2',
        ],
        credentialSubject: {
          encodedList: 'encodedList',
          id: 'https://example.com/credentials/status/3#list',
          statusPurpose: 'revocation',
          type: 'BitstringStatusList',
        },
        issuer: 'did:web:trustvc.github.io:did:1',
        type: ['VerifiableCredential', 'BitstringStatusListCredential'],
        validFrom: expect.any(String),
      });

      // Explicitly verify that issuanceDate is not present in v2.0
      expect(credentialStatusPayload).not.toHaveProperty('issuanceDate');
    });

    it('should return an error if type is not supported', async () => {
      expect(
        createCredentialStatusPayload(
          {
            id: 'https://example.com/credentials/3732',
          } as any,
          BLS_KEY_PAIR,
          'unsupported' as any,
        ),
      ).rejects.toThrowError('Unsupported type: unsupported');
    });
  });
});
