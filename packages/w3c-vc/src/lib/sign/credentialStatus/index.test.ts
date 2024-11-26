import { describe, expect, it } from 'vitest';
import { assertCredentialStatus } from '.';

describe('sign credential status', () => {
  describe('assertCredentialStatus', () => {
    it('should throw an error if the type is not supported', () => {
      expect(() => assertCredentialStatus('unsupported' as any)).toThrowError(
        '"credentialStatus" must include a type.',
      );
    });

    it('should not throw an error if the type is supported', () => {
      expect(() =>
        assertCredentialStatus({
          id: 'https://example.com/credentials/3732',
          type: 'StatusList2021Entry',
          statusPurpose: 'revocation',
          statusListIndex: '1',
          statusListCredential: 'https://example.com/credentials/statuslist/3',
        }),
      ).not.toThrowError();
    });
  });
});
