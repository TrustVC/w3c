import { base58btc } from 'multiformats/bases/base58';
import { DIDDocument } from 'did-resolver';
import { VerificationType } from '../lib/types';
import { DidWellKnownDocument } from '../did-web/wellKnown/types';
import { DidKeyInfo, DidKeyType } from './types';
import { decodeVarint, encodeVarint } from './varint';

// Multicodec code points (varint values, not raw byte sequences).
// https://github.com/multiformats/multicodec/blob/master/table.csv
const MULTICODEC_BLS12381_G2_PUB = 0xeb;
const MULTICODEC_P256_PUB = 0x1200;

/**
 * Returns true when the given URI is a `did:key:` DID (possibly with fragment).
 * @param {string} uri - The URI to check.
 * @returns {boolean} Whether `uri` is a did:key DID.
 */
export const isDidKey = (uri: string): boolean => {
  return typeof uri === 'string' && uri.startsWith('did:key:');
};

/**
 * Parses a `did:key:` DID (with or without a fragment) and extracts key info.
 * @param {string} didKey - The did:key DID or DID URL.
 * @returns {DidKeyInfo} Decoded key info: DID, verification method id, raw public key, key type.
 */
export const parseDidKey = (didKey: string): DidKeyInfo => {
  const did = didKey.split('#')[0];
  if (!did.startsWith('did:key:')) {
    throw new Error(`Not a did:key: ${didKey}`);
  }
  const multibase = did.slice('did:key:'.length);
  if (!multibase.startsWith(base58btc.prefix)) {
    throw new Error(`did:key must use base58btc multibase (z prefix): ${didKey}`);
  }
  const decoded = base58btc.decode(multibase);
  const { value: codec, bytesRead } = decodeVarint(decoded);
  const publicKey = decoded.slice(bytesRead);

  let keyType: DidKeyType;
  if (codec === MULTICODEC_BLS12381_G2_PUB) {
    keyType = 'Bls12381G2';
  } else if (codec === MULTICODEC_P256_PUB) {
    keyType = 'P-256';
  } else {
    throw new Error(`Unsupported did:key multicodec: 0x${codec.toString(16)}`);
  }

  return {
    did,
    verificationMethodId: `${did}#${multibase}`,
    publicKeyMultibase: multibase,
    publicKey,
    keyType,
  };
};

/**
 * Encode raw public key bytes as a `did:key:` DID.
 * @param {DidKeyType} keyType - Key type to use for the multicodec prefix.
 * @param {Uint8Array} publicKey - The raw public key bytes (no multicodec prefix).
 * @returns {DidKeyInfo} The resulting DID info including its canonical verification method id.
 */
export const publicKeyToDidKey = (keyType: DidKeyType, publicKey: Uint8Array): DidKeyInfo => {
  const codec = keyType === 'Bls12381G2' ? MULTICODEC_BLS12381_G2_PUB : MULTICODEC_P256_PUB;
  const prefix = encodeVarint(codec);
  const combined = new Uint8Array(prefix.length + publicKey.length);
  combined.set(prefix, 0);
  combined.set(publicKey, prefix.length);
  const multibase = base58btc.encode(combined);
  const did = `did:key:${multibase}`;
  return {
    did,
    verificationMethodId: `${did}#${multibase}`,
    publicKeyMultibase: multibase,
    publicKey,
    keyType,
  };
};

/**
 * Convenience: re-derive a did:key DID from an existing Multikey publicKeyMultibase
 * (which already encodes the multicodec prefix, e.g. from `generateKeyPair`).
 * @param {string} publicKeyMultibase - z-prefixed base58btc multibase.
 * @returns {DidKeyInfo} The resulting DID info.
 */
export const multibaseToDidKey = (publicKeyMultibase: string): DidKeyInfo => {
  return parseDidKey(`did:key:${publicKeyMultibase}`);
};

/**
 * Build the W3C DID Document for a `did:key:` DID.
 * The same Multikey verification method is referenced under every relationship.
 * @param {DidKeyInfo} info - DID info from `parseDidKey` / `publicKeyToDidKey`.
 * @returns {DidWellKnownDocument} A DID document compatible with the resolver shape.
 */
export const buildDidKeyDocument = (info: DidKeyInfo): DidWellKnownDocument => {
  const verificationMethod: DIDDocument['verificationMethod'] = [
    {
      id: info.verificationMethodId,
      type: VerificationType.Multikey,
      controller: info.did,
      publicKeyMultibase: info.publicKeyMultibase,
    },
  ];
  return {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/multikey/v1'],
    id: info.did,
    verificationMethod,
    authentication: [info.verificationMethodId],
    assertionMethod: [info.verificationMethodId],
    capabilityInvocation: [info.verificationMethodId],
    capabilityDelegation: [info.verificationMethodId],
  } as DidWellKnownDocument;
};
