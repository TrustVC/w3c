import { describe, expect, it } from 'vitest';
import { CryptoSuite, VerificationType } from '../lib/types';
import { generateDidKeyPair } from './keyPair';
import { parseDidKey } from './parse';

describe('generateDidKeyPair', () => {
  it('generates a P-256 did:key for ECDSA-SD-2023', async () => {
    const result = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
    expect(result.did.startsWith('did:key:z')).toBe(true);
    expect(result.didKeyPairs.type).toBe(VerificationType.Multikey);
    expect(result.didKeyPairs.controller).toBe(result.did);
    expect(result.didKeyPairs.id).toBe(`${result.did}#${result.didKeyPairs.publicKeyMultibase}`);
    expect(result.didKeyPairs.publicKeyMultibase).toBeDefined();
    expect(result.didKeyPairs.secretKeyMultibase).toBeDefined();

    // The generated DID must round-trip through the parser.
    const parsed = parseDidKey(result.did);
    expect(parsed.keyType).toBe('P-256');
  });

  it('generates a BLS12-381 G2 did:key for BBS-2023', async () => {
    const result = await generateDidKeyPair(CryptoSuite.Bbs2023);
    expect(result.did.startsWith('did:key:z')).toBe(true);
    expect(result.didKeyPairs.type).toBe(VerificationType.Multikey);
    expect(result.didKeyPairs.controller).toBe(result.did);

    const parsed = parseDidKey(result.did);
    expect(parsed.keyType).toBe('Bls12381G2');
  });
});
