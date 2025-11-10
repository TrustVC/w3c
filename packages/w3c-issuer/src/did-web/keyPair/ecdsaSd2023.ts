import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import { DidWebGeneratedKeyPair } from './types';
import { VerificationType } from '../../lib/types';

/**
 * Generate ECDSA-SD-2023 key pair using EcdsaMultikey.
 * Note: ECDSA key generation does not support deterministic seed-based generation.
 * Keys are generated randomly using secure cryptographic methods.
 *
 * @returns {Promise<DidWebGeneratedKeyPair>} - Generated ECDSA-SD-2023 key pair
 */
export const generateEcdsaSd2023KeyPair = async (): Promise<DidWebGeneratedKeyPair> => {
  // Generate ECDSA key pair using P-256 curve for ECDSA-SD-2023
  const ecdsaKeyPair = await EcdsaMultikey.generate({
    curve: 'P-256',
  });

  // Export the key pair to get multibase-encoded keys
  const exportedKeys = await ecdsaKeyPair.export({
    publicKey: true,
    secretKey: true,
  });

  const keyPair: DidWebGeneratedKeyPair = {
    type: VerificationType.Multikey,
    secretKeyMultibase: exportedKeys.secretKeyMultibase,
    publicKeyMultibase: exportedKeys.publicKeyMultibase,
  };

  return keyPair;
};
