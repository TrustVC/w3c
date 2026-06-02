import { Bbs2023PrivateKeyPair, EcdsaSd2023PrivateKeyPair } from '../did-web/wellKnown/types';

export type DidKeyType = 'Bls12381G2' | 'P-256';

export interface DidKeyInfo {
  did: string;
  verificationMethodId: string;
  publicKeyMultibase: string;
  publicKey: Uint8Array;
  keyType: DidKeyType;
}

export type DidKeyPrivateKeyPair = Bbs2023PrivateKeyPair | EcdsaSd2023PrivateKeyPair;

export interface GeneratedDidKey {
  did: string;
  didKeyPairs: DidKeyPrivateKeyPair;
}
