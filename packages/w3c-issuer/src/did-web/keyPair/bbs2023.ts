import * as Bls12381Multikey from '@digitalbazaar/bls12-381-multikey';
import { base58btc } from 'multiformats/bases/base58';
import { DidWebGeneratedKeyPair, DidWebGenerateKeyPairOptions } from './types';
import { VerificationType } from '../../lib/types';

/**
 * Generate BBS-2023 key pair using Bls12381Multikey.
 *
 * @param {DidWebGenerateKeyPairOptions} options - Options for key pair generation
 * @returns {Promise<DidWebGeneratedKeyPair>} - Generated BBS-2023 key pair
 */
export const generateBbs2023KeyPair = async ({
  seed,
}: DidWebGenerateKeyPairOptions): Promise<DidWebGeneratedKeyPair> => {
  if (!seed) {
    throw new Error('Invalid seed');
  }

  // Generate BBS key pair using the new BBS-2023 algorithm
  const bbsKeyPair = await Bls12381Multikey.generateBbsKeyPair({
    algorithm: 'BBS-BLS12-381-SHA-256',
    seed,
  });

  // Export the key pair to get multibase-encoded keys
  const exportedKeys = await bbsKeyPair.export({
    publicKey: true,
    secretKey: true,
  });

  const keyPair: DidWebGeneratedKeyPair = {
    type: VerificationType.Multikey,
    seedBase58: base58btc.encode(seed).slice(1),
    secretKeyMultibase: exportedKeys.secretKeyMultibase,
    publicKeyMultibase: exportedKeys.publicKeyMultibase,
  };

  return keyPair;
};
