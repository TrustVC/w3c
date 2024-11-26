import { describe, expect, it } from 'vitest';
import { getDomain } from '.';

describe('index', () => {
  describe('getDomain', () => {
    it('should return domain name, strip protocol', () => {
      const domain = 'https://example.com/';
      const result = getDomain(domain);
      expect(result).toBe('example.com');
    });
    it('should return domain name, strip protocol and query', () => {
      const domain = 'https://example.com/part/index?id=123';
      const result = getDomain(domain);
      expect(result).toBe('example.com/part/index');
    });
    it('should return domain name, strip protocol, hash and query', () => {
      const domain = 'https://example.com/part/index?id=123#1';
      const result = getDomain(domain);
      expect(result).toBe('example.com/part/index');
    });
  });
});
