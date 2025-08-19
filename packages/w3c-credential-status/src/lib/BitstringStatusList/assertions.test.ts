import { describe, it, expect } from 'vitest';
import {
  _checkCredentialSubjectForStatusList2021Credential,
  _checkCredentialSubjectForBitstringStatusListCredential,
  isBoolean,
  isNonNegativeInteger,
  isNumber,
  isPositiveInteger,
  isString,
  isUint8Array,
} from './assertions';

describe('assertions', () => {
  describe('isNumber', () => {
    it('should throw if not a number', () => {
      expect(() => isNumber('1' as any, 'test')).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: "test" must be number.]`,
      );
    });
    it('should not throw if a number', () => {
      expect(() => isNumber(1, 'test')).not.toThrow();
    });
  });

  describe('isPositiveInteger', () => {
    it('should throw if not a positive integer', () => {
      expect(() => isPositiveInteger(-1, 'test')).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: "test" must be a positive integer.]`,
      );
    });
    it('should throw if its 0', () => {
      expect(() => isPositiveInteger(0, 'test')).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: "test" must be a positive integer.]`,
      );
    });
    it('should not throw if a positive integer', () => {
      expect(() => isPositiveInteger(1, 'test')).not.toThrow();
    });
  });

  describe('isNonNegativeInteger', () => {
    it('should throw if not a non-negative integer', () => {
      expect(() => isNonNegativeInteger(-1, 'test')).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: "test" must be a non-negative integer.]`,
      );
    });
    it('should not throw if a non-negative integer', () => {
      expect(() => isNonNegativeInteger(0, 'test')).not.toThrow();
    });
  });

  describe('isString', () => {
    it('should throw if not a string', () => {
      expect(() => isString(1 as any, 'test')).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: "test" must be a string.]`,
      );
    });
    it('should not throw if a string', () => {
      expect(() => isString('1', 'test')).not.toThrow();
    });
  });

  describe('isBoolean', () => {
    it('should throw if not a boolean', () => {
      expect(() => isBoolean(1 as any, 'test')).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: "test" must be a Boolean.]`,
      );
    });
    it('should not throw if a boolean', () => {
      expect(() => isBoolean(true, 'test')).not.toThrow();
    });
  });

  describe('isUint8Array', () => {
    it('should throw if not a Uint8Array', () => {
      expect(() => isUint8Array(1 as any, 'test')).toThrowErrorMatchingInlineSnapshot(
        `[TypeError: "test" must be a Uint8Array.]`,
      );
    });
    it('should not throw if a Uint8Array', () => {
      expect(() => isUint8Array(new Uint8Array(), 'test')).not.toThrow();
    });
  });

  describe.each([
    {
      functionName: '_checkCredentialSubjectForStatusList2021Credential',
      testFunction: _checkCredentialSubjectForStatusList2021Credential,
      expectedType: 'StatusList2021' as const,
      credentialType: 'StatusList2021Credential',
      wrongType: 'BitstringStatusList' as const,
    },
    {
      functionName: '_checkCredentialSubjectForBitstringStatusListCredential',
      testFunction: _checkCredentialSubjectForBitstringStatusListCredential,
      expectedType: 'BitstringStatusList' as const,
      credentialType: 'BitstringStatusListCredential',
      wrongType: 'StatusList2021' as const,
    },
  ])('$functionName', ({ testFunction, expectedType, credentialType, wrongType }) => {
    it('should throw if no credentialSubject', () => {
      expect(() => testFunction(undefined as any)).toThrow('Credential subject must be an object.');
    });

    it('should throw if no type', () => {
      expect(() =>
        testFunction({
          statusPurpose: 'revocation',
          encodedList: 'test',
        } as any),
      ).toThrow('Credential subject must have a type.');
    });

    it('should throw if wrong type', () => {
      expect(() =>
        testFunction({
          type: wrongType,
          statusPurpose: 'revocation',
          encodedList: 'test',
        } as any),
      ).toThrow(
        `Invalid type for credentialSubject: Credential subject for ${credentialType} must have type "${expectedType}".`,
      );
    });

    it('should throw if no statusPurpose', () => {
      expect(() =>
        testFunction({
          type: expectedType,
          encodedList: 'test',
        } as any),
      ).toThrow('Credential subject must have a statusPurpose.');
    });

    it('should throw if invalid statusPurpose', () => {
      expect(() =>
        testFunction({
          type: expectedType,
          encodedList: 'test',
          statusPurpose: 'test',
        } as any),
      ).toThrow('Unsupported statusPurpose: statusPurpose must be "revocation" or "suspension".');
    });

    it('should throw if no encodedList', () => {
      expect(() =>
        testFunction({
          type: expectedType,
          statusPurpose: 'revocation',
        } as any),
      ).toThrow('Credential subject must have an encodedList.');
    });

    it('should throw if empty encodedList', () => {
      expect(() =>
        testFunction({
          type: expectedType,
          statusPurpose: 'revocation',
          encodedList: '',
        } as any),
      ).toThrow('Credential subject must have a non-empty encodedList.');
    });

    it('should not throw for valid credential subject with revocation', () => {
      expect(() =>
        testFunction({
          type: expectedType,
          statusPurpose: 'revocation',
          encodedList: 'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA',
        }),
      ).not.toThrow();
    });

    it('should not throw for valid credential subject with suspension', () => {
      expect(() =>
        testFunction({
          type: expectedType,
          statusPurpose: 'suspension',
          encodedList: 'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA',
        }),
      ).not.toThrow();
    });
  });
});
