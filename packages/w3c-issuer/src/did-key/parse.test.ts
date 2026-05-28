import { base58btc } from 'multiformats/bases/base58';
import { describe, expect, it } from 'vitest';
import { VerificationType } from '../lib/types';
import {
  buildDidKeyDocument,
  isDidKey,
  multibaseToDidKey,
  parseDidKey,
  publicKeyToDidKey,
} from './parse';
import { encodeVarint } from './varint';

const encodeDidKey = (codec: number, keyBytes: Uint8Array): string => {
  const prefix = encodeVarint(codec);
  const combined = new Uint8Array(prefix.length + keyBytes.length);
  combined.set(prefix, 0);
  combined.set(keyBytes, prefix.length);
  return `did:key:${base58btc.encode(combined)}`;
};

const P256_PUBLIC_KEY_MULTIBASE = 'zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc';
const BLS_PUBLIC_KEY_MULTIBASE =
  'zUC7HnpncVAkTjtL6B8prX6bQM2WA5sJ7rXFeCqyrvPnrzoFBjYsVUTNwzhhPUazja73tWwPeEBWCUgq5qBSrtrXiYhVvBCgZPTCiWANj7TSiZJ6SnyC3pkt94GiuChhAvmRRbt';

describe('did:key parse', () => {
  describe('isDidKey', () => {
    it('returns true for did:key URIs', () => {
      expect(isDidKey('did:key:zDna...')).toBe(true);
    });

    it('returns false for non-did:key URIs', () => {
      expect(isDidKey('did:web:example.com')).toBe(false);
      expect(isDidKey('https://example.com')).toBe(false);
      expect(isDidKey('')).toBe(false);
    });
  });

  describe('parseDidKey', () => {
    it('parses a P-256 did:key (zDna prefix)', () => {
      const did = `did:key:${P256_PUBLIC_KEY_MULTIBASE}`;
      const info = parseDidKey(did);
      expect(info.did).toBe(did);
      expect(info.keyType).toBe('P-256');
      expect(info.publicKeyMultibase).toBe(P256_PUBLIC_KEY_MULTIBASE);
      expect(info.verificationMethodId).toBe(`${did}#${P256_PUBLIC_KEY_MULTIBASE}`);
      expect(info.publicKey.length).toBe(33); // P-256 compressed
    });

    it('parses a BLS12-381 G2 did:key (zUC7 prefix)', () => {
      const did = `did:key:${BLS_PUBLIC_KEY_MULTIBASE}`;
      const info = parseDidKey(did);
      expect(info.keyType).toBe('Bls12381G2');
      expect(info.publicKeyMultibase).toBe(BLS_PUBLIC_KEY_MULTIBASE);
      expect(info.publicKey.length).toBe(96); // BLS12-381 G2 compressed
    });

    it('parses a did:key URL with fragment and strips it from `did`', () => {
      const did = `did:key:${P256_PUBLIC_KEY_MULTIBASE}`;
      const vmUrl = `${did}#${P256_PUBLIC_KEY_MULTIBASE}`;
      const info = parseDidKey(vmUrl);
      expect(info.did).toBe(did);
      expect(info.verificationMethodId).toBe(vmUrl);
    });

    it('rejects non-did:key inputs', () => {
      expect(() => parseDidKey('did:web:example.com')).toThrow(/Not a did:key/);
    });

    it('rejects non-base58btc multibase', () => {
      expect(() => parseDidKey('did:key:mAbc')).toThrow(/base58btc/);
    });

    it('rejects unsupported multicodec (Ed25519)', () => {
      // z6Mk... is the canonical Ed25519 did:key prefix.
      expect(() => parseDidKey('did:key:z6MkpTHR8VNsBxYAAWHut2Geo2LdLLChG4Wkw5kJp9TQq7Pe')).toThrow(
        /Unsupported did:key multicodec/,
      );
    });

    it('rejects a P-256 did:key with wrong public key length', () => {
      // 32 bytes instead of the canonical 33 (missing the compressed-point tag byte).
      const tampered = encodeDidKey(0x1200, new Uint8Array(32));
      expect(() => parseDidKey(tampered)).toThrow(/Invalid P-256 public key length/);
    });

    it('rejects a BLS12-381 G2 did:key with wrong public key length', () => {
      // 95 bytes instead of the canonical 96.
      const tampered = encodeDidKey(0xeb, new Uint8Array(95));
      expect(() => parseDidKey(tampered)).toThrow(/Invalid Bls12381G2 public key length/);
    });

    it('rejects an over-long varint prefix that would collide via 32-bit truncation', () => {
      // 5-byte varint encoding a value > 2^32 whose low 32 bits equal 0xeb.
      // Without the prefix-length cap this could be misread as the BLS12-381 G2 codec.
      const overlong = new Uint8Array([0xeb, 0x80, 0x80, 0x80, 0x10]);
      const combined = new Uint8Array(overlong.length + 96);
      combined.set(overlong, 0);
      const tampered = `did:key:${base58btc.encode(combined)}`;
      expect(() => parseDidKey(tampered)).toThrow(/Varint exceeds maximum length/);
    });
  });

  describe('publicKeyToDidKey', () => {
    it('round-trips with parseDidKey', () => {
      const original = parseDidKey(`did:key:${P256_PUBLIC_KEY_MULTIBASE}`);
      const rebuilt = publicKeyToDidKey(original.keyType, original.publicKey);
      expect(rebuilt.did).toBe(original.did);
      expect(rebuilt.publicKeyMultibase).toBe(original.publicKeyMultibase);
    });

    it('round-trips for BLS12-381 G2', () => {
      const original = parseDidKey(`did:key:${BLS_PUBLIC_KEY_MULTIBASE}`);
      const rebuilt = publicKeyToDidKey(original.keyType, original.publicKey);
      expect(rebuilt.did).toBe(original.did);
    });
  });

  describe('multibaseToDidKey', () => {
    it('produces canonical id/controller from a publicKeyMultibase', () => {
      const info = multibaseToDidKey(P256_PUBLIC_KEY_MULTIBASE);
      expect(info.did).toBe(`did:key:${P256_PUBLIC_KEY_MULTIBASE}`);
      expect(info.verificationMethodId).toBe(
        `did:key:${P256_PUBLIC_KEY_MULTIBASE}#${P256_PUBLIC_KEY_MULTIBASE}`,
      );
    });
  });

  describe('buildDidKeyDocument', () => {
    it('builds a DID document with a Multikey verification method', () => {
      const info = parseDidKey(`did:key:${P256_PUBLIC_KEY_MULTIBASE}`);
      const doc = buildDidKeyDocument(info);
      expect(doc.id).toBe(info.did);
      expect(doc.verificationMethod).toHaveLength(1);
      expect(doc.verificationMethod?.[0]).toEqual({
        id: info.verificationMethodId,
        type: VerificationType.Multikey,
        controller: info.did,
        publicKeyMultibase: info.publicKeyMultibase,
      });
      expect(doc.assertionMethod).toContain(info.verificationMethodId);
      expect(doc.authentication).toContain(info.verificationMethodId);
      expect(doc.capabilityInvocation).toContain(info.verificationMethodId);
      expect(doc.capabilityDelegation).toContain(info.verificationMethodId);
    });
  });
});
