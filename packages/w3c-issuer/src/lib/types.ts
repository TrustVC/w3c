import {
  DidEtherGenerateKeyPairOptions as DidEtherGenerateKeyPairOptions,
  DidEtherGeneratedKeyPair as DidEtherGeneratedKeyPair,
} from './../did-ethr/keyPair/types';
import {
  DidWebGenerateKeyPairOptions as DidWebGenerateKeyPairOptions,
  DidWebGeneratedKeyPair as DidWebGeneratedKeyPair,
} from './../did-web/keyPair/types';

/**
 * https://www.w3.org/TR/did-spec-registries/#verification-method-types
 */
export enum VerificationType {
  JsonWebKey2020 = 'JsonWebKey2020',
  EcdsaSecp256k1VerificationKey2019 = 'EcdsaSecp256k1VerificationKey2019',
  Ed25519VerificationKey2018 = 'Ed25519VerificationKey2018',
  Bls12381G1Key2020 = 'Bls12381G1Key2020',
  Bls12381G2Key2020 = 'Bls12381G2Key2020',
  EcdsaSecp256k1RecoveryMethod2020 = 'EcdsaSecp256k1RecoveryMethod2020',
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
  [VerificationType.EcdsaSecp256k1RecoveryMethod2020]:
    'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
};

export type BaseKeyPair = {
  type: VerificationType;
};

export type GenerateKeyPairOptions = Required<BaseKeyPair> &
  Partial<DidEtherGenerateKeyPairOptions> &
  Partial<DidWebGenerateKeyPairOptions>;

export type GeneratedKeyPair = Required<BaseKeyPair> &
  Partial<DidEtherGeneratedKeyPair> &
  Partial<DidWebGeneratedKeyPair>;
