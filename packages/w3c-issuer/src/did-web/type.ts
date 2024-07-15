import { DIDDocument } from 'did-resolver';

export enum SecurityVocabTypeToContext {
  Ed25519VerificationKey2018 = 'Ed25519VerificationKey2018',
  Bls12381G2Key2020 = 'Bls12381G2Key2020',
}

export type GenerateKeyPairType = {
  type?: SecurityVocabTypeToContext;
  seed?: Uint8Array;
  seedBase58?: string;
  privateKeyBase58?: string;
  publicKeyBase58?: string;
};

export type GeneratedKeyPairType = GenerateKeyPairType & {
  privateKey?: Uint8Array;
  publicKey?: Uint8Array;
};

export type KeyPairType = GenerateKeyPairType & {
  domain: string;
};

export type IssuedDIDType = {
  did: object;
  keyPairs: {
    id: string;
    type: string;
    controller: string;
    privateKeyBase58: string;
    publicKeyBase58: string;
  };
};

export enum WellKnownEnum {
  ALSO_KNOWN_AS = 'alsoKnownAs',
  ASSERTION_METHOD = 'assertionMethod',
  AUTHENTICATION = 'authentication',
  CAPABILITY_DELEGATION = 'capabilityDelegation',
  CAPABILITY_INVOCATION = 'capabilityInvocation',
  CONTROLLER = 'controller',
  KEY_AGRREEMENT = 'keyAgreement',
  SERVICE = 'service',
  VERIFICATION_METHOD = 'verificationMethod',
}

export type DidKeyPair = {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58: string;
};

export type DidPrivateKeyPair = DidKeyPair & {
  seedBase58: string;
  privateKeyBase58: string;
};

export type DidWellKnownDocument = DIDDocument;
