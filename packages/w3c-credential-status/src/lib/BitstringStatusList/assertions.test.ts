import { describe, it, expect } from 'vitest';
import {
  _checkCredentialSubjectForStatusList2021Credential,
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

  describe('_checkCredentialSubjectForStatusList2021Credential', () => {
    it('should throw if no credentialSubject', () => {
      expect(() =>
        _checkCredentialSubjectForStatusList2021Credential(undefined as any),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Credential subject must be an object.]`);
    });

    it('should throw if no type', () => {
      expect(() =>
        _checkCredentialSubjectForStatusList2021Credential({} as any),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Credential subject must have a type.]`);
    });
    it('should throw if wrong type', () => {
      expect(() =>
        _checkCredentialSubjectForStatusList2021Credential({ type: 'test' } as any),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid type for credentialSubject: Credential subject for StatusList2021Credential must have type "StatusList2021".]`,
      );
    });

    it('should throw if no statusPurpose', () => {
      expect(() =>
        _checkCredentialSubjectForStatusList2021Credential({ type: 'StatusList2021' } as any),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Credential subject must have a statusPurpose.]`,
      );
    });
    it('should throw if wrong statusPurpose', () => {
      expect(() =>
        _checkCredentialSubjectForStatusList2021Credential({
          type: 'StatusList2021',
          statusPurpose: 'test',
        } as any),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Unsupported statusPurpose: statusPurpose must be "revocation" or "suspension".]`,
      );
    });

    it('should throw if no encodedList', () => {
      expect(() =>
        _checkCredentialSubjectForStatusList2021Credential({
          type: 'StatusList2021',
          statusPurpose: 'revocation',
        } as any),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Credential subject must have an encodedList.]`);
    });
    it('should throw if empty encodedList', () => {
      expect(() =>
        _checkCredentialSubjectForStatusList2021Credential({
          type: 'StatusList2021',
          statusPurpose: 'revocation',
          encodedList: '',
        } as any),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Credential subject must have a non-empty encodedList.]`,
      );
    });
  });
});
