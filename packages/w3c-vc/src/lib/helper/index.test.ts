import * as w3c_credential_status from '@trustvc/w3c-credential-status';
import * as uuid from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _checkCredentialStatus, prefilCredentialId } from '.';

describe('helper', () => {
  describe('_checkCredentialStatus', () => {
    it('should return true if the credential status is valid', () => {
      vi.spyOn(w3c_credential_status, 'assertStatusList2021Entry').mockResolvedValue();

      expect(_checkCredentialStatus({ type: 'StatusList2021Entry' } as any)).toBeUndefined();
    });

    it('should throw an error if validation fails', () => {
      vi.spyOn(w3c_credential_status, 'assertCredentialStatusType').mockImplementation(() => {
        throw new Error('Invalid type');
      });

      expect(() => _checkCredentialStatus({} as any)).toThrowError('Invalid type');
    });

    describe('_checkCredentialStatus', () => {
      it('should return true if the credential status is valid', () => {
        vi.spyOn(w3c_credential_status, 'assertStatusList2021Entry').mockResolvedValue();

        expect(_checkCredentialStatus({ type: 'StatusList2021Entry' } as any)).toBeUndefined();
      });

      it('should throw an error if validation fails', () => {
        vi.spyOn(w3c_credential_status, 'assertCredentialStatusType').mockImplementation(() => {
          throw new Error('Invalid type');
        });

        expect(() => _checkCredentialStatus({} as any)).toThrowError('Invalid type');
      });
    });

    describe('prefilCredentialId', () => {
      beforeEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
      });

      it('should prefill the credential ID with a UUIDv7', () => {
        const mockUuid = '123e4567-e89b-12d3-a456-426614174000';
        vi.spyOn(uuid, 'v7').mockReturnValue(mockUuid);

        const credential = { credentialStatus: {} } as any;
        const result = prefilCredentialId(credential);

        expect(result.id).toBe(`urn:bnid:_:${mockUuid}`);
      });

      it('should set the tokenId if credentialStatus type is TransferableRecords', () => {
        const mockUuid = '123e4567-e89b-12d3-a456-426614174000';
        vi.spyOn(uuid, 'v7').mockReturnValue(mockUuid);

        const credential = { credentialStatus: { type: 'TransferableRecords' } } as any;
        const result = prefilCredentialId(credential);

        expect(result.credentialStatus.tokenId).toBe(
          '62da3de2b2899ef239cacd5ee0b3ed6d67dec97df55df5e7cb531e03354c813f',
        );
      });
    });
  });
});
