import { CredentialStatusPurpose, VCBitstringCredentialSubject } from './types';
import {
  assertCredentialStatusType,
  assertStatusListIndex,
  assertStatusPurposeMatches,
} from './utils';
import { describe, expect, it } from 'vitest';

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
});
