import crypto from 'crypto';
import { parseMultibase } from '../../lib';
import { GeneratedKeyPair, GenerateKeyPairOptions, VerificationType } from '../../lib/types';
import { generateBls12381KeyPair } from './bls12381';
import { DidWebGeneratedKeyPair } from './types';

/**
 * Generate key pair based on the type.
 * If seed is provided, it will be used to generate the key pair.
 * If private key and public key are provided, it will be verified against the generated seed's key pair.
 *
 * @param {GenerateKeyPairOptions} keyPairOptions
 * @param {VerificationType} keyPairOptions.type - Type of key pair to generate, supported types are Bls12381G2Key2020 and EcdsaSecp256k1RecoveryMethod2020
 *
 * @param {string} keyPairOptions.seedBase58 - Seed in base58 format (optional)
 * @param {string} keyPairOptions.privateKeyBase58 - Private key in base58 format (optional)
 * @param {string} keyPairOptions.publicKeyBase58 - Public key in base58 format (optional)
 *
 * @param {string} keyPairOptions.mnemonics - Mnemonics for did:ethr [EcdsaSecp256k1RecoveryMethod2020] (optional)
 * @param {string} keyPairOptions.privateKeyHex - Private key in hex format for did:ethr [EcdsaSecp256k1RecoveryMethod2020] (optional)
 * @param {string} keyPairOptions.blockchainAccountId - Public address for did:ethr [EcdsaSecp256k1RecoveryMethod2020] (optional)
 *
 * @returns {Promise<GeneratedKeyPair>} - Generated key pair
 */
export const generateKeyPair = async (
  keyPairOptions: GenerateKeyPairOptions,
): Promise<GeneratedKeyPair> => {
  const { type, seedBase58, privateKeyBase58, publicKeyBase58 } = keyPairOptions;

  if (!type) {
    throw new Error('Invalid key pair type');
  }

  let seed: Uint8Array | undefined;

  if (type !== VerificationType.EcdsaSecp256k1RecoveryMethod2020) {
    if (seedBase58) {
      seed = await parseMultibase('z' + seedBase58);
    }
    keyPairOptions.seed = seed ?? Uint8Array.from(crypto.randomBytes(32));
  }

  let generatedKeyPair: GeneratedKeyPair;

  switch (type) {
    case VerificationType.Ed25519VerificationKey2018:
      throw new Error('Unsupported key pair type');
    case VerificationType.Bls12381G2Key2020:
      generatedKeyPair = await generateBls12381KeyPair(keyPairOptions);
      break;
    default:
      throw new Error('Unsupported key pair type');
  }

  // If seed is provided, check against provided private key and public key
  if (seedBase58) {
    generatedKeyPair = generatedKeyPair as DidWebGeneratedKeyPair;
    if (privateKeyBase58 && privateKeyBase58 !== generatedKeyPair.privateKeyBase58) {
      throw new Error('Private key does not match');
    }
    if (publicKeyBase58 && publicKeyBase58 !== generatedKeyPair.publicKeyBase58) {
      throw new Error('Public key does not match');
    }
  }

  return generatedKeyPair;
};
