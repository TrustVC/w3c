import { describe, expect, it } from 'vitest';
import { CredentialStatusPurpose, VCBitstringCredentialSubject } from './types';
import {
  assertCredentialStatusType,
  assertObligationRecords,
  assertStatusListIndex,
  assertStatusPurposeMatches,
  assertTransferableRecords,
  fetchCredentialStatusVC,
} from './utils';

describe('utils.ts', () => {
  describe('assertCredentialStatusType', () => {
    it('should throw an error if the type is not supported', () => {
      expect(() => assertCredentialStatusType('unsupported')).toThrowError(
        'Unsupported type: unsupported',
      );
    });

    it('should not throw an error if the type is supported', () => {
      expect(() => assertCredentialStatusType('StatusList2021Entry')).not.toThrowError();
    });
  });

  describe('assertStatusListIndex', () => {
    it('should throw an error if the statusListIndex is invalid', () => {
      expect(() => assertStatusListIndex('invalid')).toThrowError(
        "Invalid statusListIndex: Invalid Number: 'invalid'",
      );
    });

    it('should not throw an error if the statusListIndex is valid', () => {
      expect(() => assertStatusListIndex('0')).not.toThrowError();
    });
  });

  describe('assertStatusPurposeMatches', () => {
    it('should throw an error if the statusPurpose does not match', () => {
      const statusList: VCBitstringCredentialSubject = {
        type: 'StatusList2021',
        statusPurpose: 'revocation',
        encodedList: 'encodedList',
      };
      const statusPurpose: CredentialStatusPurpose = 'suspension';
      expect(() => assertStatusPurposeMatches(statusList, statusPurpose)).toThrowError(
        'statusPurpose does not match the statusPurpose in the statusListCredential',
      );
    });
    it('should not throw an error if the statusPurpose matches', () => {
      const statusList: VCBitstringCredentialSubject = {
        type: 'StatusList2021',
        statusPurpose: 'revocation',
        encodedList: 'encodedList',
      };
      const statusPurpose: CredentialStatusPurpose = 'revocation';
      expect(() => assertStatusPurposeMatches(statusList, statusPurpose)).not.toThrowError();
    });
  });

  describe('assertTransferableRecords chainId', () => {
    const base = {
      type: 'TransferableRecords' as const,
      tokenId: 'abc',
      tokenRegistry: '0x123',
      tokenNetwork: { chain: 'sepolia', chainId: 11155111 as string | number },
    };

    it('accepts integer number and numeric string chainId', () => {
      expect(() => assertTransferableRecords(base)).not.toThrow();
      expect(() =>
        assertTransferableRecords({
          ...base,
          tokenNetwork: { chain: 'sepolia', chainId: '11155111' },
        }),
      ).not.toThrow();
    });

    it.each([
      ['', 'empty string'],
      ['abc', 'non-numeric'],
      ['1.5', 'fractional'],
      [NaN, 'NaN'],
      [Infinity, 'Infinity'],
      [1.5, 'fractional number'],
    ])('rejects invalid chainId (%s / %s)', (chainId: string | number, _label: string) => {
      expect(() =>
        assertTransferableRecords({
          ...base,
          tokenNetwork: { chain: 'sepolia', chainId },
        }),
      ).toThrow(/credentialStatus\.tokenNetwork\.chainId" must be an integer/);
    });
  });

  describe('assertObligationRecords chainId', () => {
    const base = {
      type: 'TransferableRecords' as const,
      tokenId: 'abc',
      obligationRegistry: '0x456',
      tokenNetwork: { chain: 'sepolia', chainId: 11155111 as string | number },
    };

    it('accepts integer chainId and rejects invalid values', () => {
      expect(() => assertObligationRecords(base)).not.toThrow();
      expect(() =>
        assertObligationRecords({
          ...base,
          tokenNetwork: { chain: 'sepolia', chainId: '' },
        }),
      ).toThrow(/credentialStatus\.tokenNetwork\.chainId" must be an integer/);
    });
  });

  describe('assertObligationRecords tokenId in sign mode', () => {
    const base = {
      type: 'TransferableRecords' as const,
      obligationRegistry: '0x456',
      tokenNetwork: { chain: 'sepolia', chainId: 11155111 as string | number },
    };

    it('accepts an omitted tokenId', () => {
      expect(() => assertObligationRecords(base, 'sign')).not.toThrow();
    });

    it('rejects an empty string tokenId', () => {
      expect(() => assertObligationRecords({ ...base, tokenId: '' }, 'sign')).toThrow(
        '"tokenId" is a generated field and should not be included in the credential status.',
      );
    });

    it('rejects a populated tokenId', () => {
      expect(() => assertObligationRecords({ ...base, tokenId: 'abc' }, 'sign')).toThrow(
        '"tokenId" is a generated field and should not be included in the credential status.',
      );
    });
  });

  describe('fetchCredentialStatusVC', () => {
    it('should fetch a credential status VC successfully', async () => {
      const vc = await fetchCredentialStatusVC(
        'https://trustvc.github.io/did/credentials/statuslist/1',
      );
      expect(vc).toMatchObject({
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/security/bbs/v1',
          'https://w3id.org/vc/status-list/2021/v1',
        ],
        credentialSubject: {
          id: 'https://trustvc.github.io/did/credentials/statuslist/1#list',
          type: 'StatusList2021',
          statusPurpose: expect.stringMatching(/revocation|suspension/),
          encodedList: expect.any(String),
        },
        id: 'https://trustvc.github.io/did/credentials/statuslist/1',
        issuanceDate: expect.any(String),
        issuer: 'did:web:trustvc.github.io:did:1',
        type: ['VerifiableCredential', 'StatusList2021Credential'],
        validFrom: expect.any(String),
        proof: {
          type: 'BbsBlsSignature2020',
          created: expect.any(String),
          proofPurpose: 'assertionMethod',
          proofValue: expect.any(String),
          verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
        },
      });
    });

    it('should throw an error if the VC is not found', async () => {
      expect(
        fetchCredentialStatusVC('https://trustvc.github.io/did/credentials/statuslist/3'),
      ).rejects.toThrowError('Credential Status VC not found');
    });

    it('should throw an error if it not a valid url', async () => {
      expect(fetchCredentialStatusVC('invalid')).rejects.toThrowError(
        'Invalid statusListCredential: "invalid"',
      );
    });
  });
});
