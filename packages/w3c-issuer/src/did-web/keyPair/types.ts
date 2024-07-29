/**
 * https://www.w3.org/TR/did-spec-registries/#verification-method-types
 */
export enum VerificationType {
  JsonWebKey2020 = 'JsonWebKey2020',
  EcdsaSecp256k1VerificationKey2019 = 'EcdsaSecp256k1VerificationKey2019',
  Ed25519VerificationKey2018 = 'Ed25519VerificationKey2018',
  Bls12381G1Key2020 = 'Bls12381G1Key2020',
  Bls12381G2Key2020 = 'Bls12381G2Key2020',
}

export const VerificationContext: { [key in VerificationType]: string } = {
  // https://w3c.github.io/vc-jws-2020/
  [VerificationType.JsonWebKey2020]: 'https://w3id.org/security/suites/jws-2020/v1',
  // https://w3c-ccg.github.io/lds-ecdsa-secp256k1-2019/
  [VerificationType.EcdsaSecp256k1VerificationKey2019]: 'https://w3id.org/security/v1',
  // https://w3c-ccg.github.io/lds-ed25519-2018/
  [VerificationType.Ed25519VerificationKey2018]: 'https://w3id.org/security/v2',
  [VerificationType.Bls12381G1Key2020]: 'https://w3id.org/security/suites/bls12381-2020/v1',
  [VerificationType.Bls12381G2Key2020]: 'https://w3id.org/security/suites/bls12381-2020/v1',
};

export type GenerateKeyPairOptions = {
  type: VerificationType;
  seed?: Uint8Array;
  seedBase58?: string;
  privateKeyBase58?: string;
  publicKeyBase58?: string;
};

export type GeneratedKeyPair = GenerateKeyPairOptions & {
  privateKey?: Uint8Array;
  publicKey?: Uint8Array;
};
