import { describe, expect, it } from 'vitest';
import { w3cVc } from './w3c-vc';

describe('w3cVc', () => {
  it('should work', () => {
    expect(w3cVc()).toEqual('w3c-vc');
  });
});
