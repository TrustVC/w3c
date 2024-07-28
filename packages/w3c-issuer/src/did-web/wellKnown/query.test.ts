import { queryWellKnownDid } from "./query";
import * as query from "./query";
import { describe, expect, it, vi } from 'vitest';

describe('query', () => {

  describe('queryWellKnownDid', () => {
    it('should fail to queryWellKnownDid without any input', async () => {
      await expect(queryWellKnownDid('')).rejects.toThrowError('Invalid / Missing domain');
    });

    it('should fail to queryWellKnownDid with invalid did', async () => {
      await expect(queryWellKnownDid('invalidDomain')).rejects.toThrowError('Invalid URL');
    });

    it('should queryWellKnownDid with valid did', async () => {
      const domain = 'https://www.google.com';
      const wellKnownDid = await queryWellKnownDid(domain);
      expect(wellKnownDid).toBe(null);
    });
  });
})
