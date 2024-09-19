import { describe, expect, it, vi } from 'vitest';
import { _checkCredentialStatus, fetchCredentialStatusVC } from './utils';
import * as w3c_credential_status from '@tradetrust-tt/w3c-credential-status';
import { _checkCredential } from '../../helper';

describe('utils.ts', () => {
  describe('fetchCredentialStatusVC', () => {
    it('should fetch a credential status VC successfully', async () => {
      const vc = await fetchCredentialStatusVC(
        'https://nghaninn.github.io/did/credentials/statuslist/1',
      );
      expect(vc).toMatchObject({
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/security/bbs/v1',
          'https://w3id.org/vc/status-list/2021/v1',
        ],
        credentialSubject: {
          id: 'https://nghaninn.github.io/did/credentials/statuslist/1#list',
          type: 'StatusList2021',
          statusPurpose: expect.stringMatching(/revocation|suspension/),
          encodedList: expect.any(String),
        },
        id: 'https://nghaninn.github.io/did/credentials/statuslist#1',
        issuanceDate: expect.any(String),
        issuer: 'did:web:nghaninn.github.io:did:1',
        type: ['VerifiableCredential', 'StatusList2021Credential'],
        validFrom: expect.any(String),
        proof: {
          type: 'BbsBlsSignature2020',
          created: expect.any(String),
          proofPurpose: 'assertionMethod',
          proofValue: expect.any(String),
          verificationMethod: 'did:web:nghaninn.github.io:did:1#keys-1',
        },
      });
    });

    it('should throw an error if the VC is not found', async () => {
      expect(
        fetchCredentialStatusVC('https://nghaninn.github.io/did/credentials/statuslist/2'),
      ).rejects.toThrowError('Credential Status VC not found');
    });

    it('should throw an error if it not a valid url', async () => {
      expect(fetchCredentialStatusVC('invalid')).rejects.toThrowError(
        'Invalid statusListCredential: "invalid"',
      );
    });
  });

  describe('_checkCredentialStatus', () => {
    it('should return true if the credential status is valid', () => {
      vi.spyOn(w3c_credential_status, 'assertCredentialStatusType').mockResolvedValue();
      vi.spyOn(w3c_credential_status, 'assertAllowedStatusPurpose').mockResolvedValue();
      vi.spyOn(w3c_credential_status, 'assertStatusListIndex').mockResolvedValue();

      expect(_checkCredentialStatus({} as any)).toBeUndefined();
    });

    it('should throw an error if validation fails', () => {
      vi.spyOn(w3c_credential_status, 'assertCredentialStatusType').mockImplementation(() => {
        throw new Error('Invalid type');
      });

      expect(() => _checkCredentialStatus({} as any)).toThrowError('Invalid type');
    });
  });
});
