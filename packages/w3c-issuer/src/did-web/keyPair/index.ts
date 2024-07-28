import { parseMultibase } from '@/tradetrust-tt/w3c-utils';
import crypto from 'crypto';
import { generateBls12381KeyPair } from './bls12381';
import { generateEd25519KeyPair } from './ed25519';
import {
  GeneratedKeyPair,
  GenerateKeyPairOptions,
  VerificationType,
} from './types';

/**
 * Generate key pair based on the type.
 * If seed is provided, it will be used to generate the key pair.
 * If private key and public key are provided, it will be verified against the generated seed's key pair.
 *
 * @param {GenerateKeyPairOptions} keyPairOptions
 * @param {VerificationType} keyPairOptions.type - Type of key pair to generate, supported types are Ed25519VerificationKey2018 and Bls12381G2Key2020
 * @param {string} keyPairOptions.seedBase58 - Seed in base58 format (optional)
 * @param {string} keyPairOptions.privateKeyBase58 - Private key in base58 format (optional)
 * @param {string} keyPairOptions.publicKeyBase58 - Public key in base58 format (optional)
 * @returns {Promise<GeneratedKeyPair>} - Generated key pair
 */
export const generateKeyPair = async (
  keyPairOptions: GenerateKeyPairOptions,
): Promise<GeneratedKeyPair> => {
  const { seedBase58, privateKeyBase58, publicKeyBase58, type } =
    keyPairOptions;

  if (!type) {
    throw new Error('Invalid key pair type');
  }

  let seed: Uint8Array | undefined;
  if (seedBase58) {
    seed = await parseMultibase('z' + seedBase58);
  }
  keyPairOptions.seed = seed ?? Uint8Array.from(crypto.randomBytes(32));

  let generatedKeyPair: GeneratedKeyPair;
  switch (type) {
    case VerificationType.Ed25519VerificationKey2018:
      generatedKeyPair = await generateEd25519KeyPair(keyPairOptions);
      break;
    case VerificationType.Bls12381G2Key2020:
      generatedKeyPair = await generateBls12381KeyPair(keyPairOptions);
      break;
    default:
      throw new Error('Unsupported key pair type');
  }

  // If seed is provided, check against provided private key and public key
  if (seedBase58 && privateKeyBase58) {
    if (privateKeyBase58 !== generatedKeyPair.privateKeyBase58) {
      throw new Error('Private key does not match');
    }
  }
  if (seedBase58 && publicKeyBase58) {
    if (publicKeyBase58 !== generatedKeyPair.publicKeyBase58) {
      throw new Error('Public key does not match');
    }
  }

  return generatedKeyPair;
};
