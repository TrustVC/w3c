import { describe, expect, it, vi } from 'vitest';
import * as w3c_credential_status from '@trustvc/w3c-credential-status';
import { _checkCredentialStatus } from '.';

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
  });
});
