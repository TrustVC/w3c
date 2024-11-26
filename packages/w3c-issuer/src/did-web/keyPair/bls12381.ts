import { Bls12381G2KeyPair } from '@mattrglobal/bls12381-key-pair';
import { base58btc } from 'multiformats/bases/base58';
import { VerificationType } from '../../lib/types';
import { DidWebGeneratedKeyPair, DidWebGenerateKeyPairOptions } from './types';

/**
 * Generate Bls12381 key pair based on the seed.
 *
 * @param {Uint8Array} seed - Seed to generate the key pair
 * @returns {Promise<DidWebGeneratedKeyPair>} - Generated Bls12381 key pair
 */
export const generateBls12381KeyPair = async ({
  seed,
}: DidWebGenerateKeyPairOptions): Promise<DidWebGeneratedKeyPair> => {
  if (!seed) {
    throw new Error('Invalid seed');
  }

  const keys = await Bls12381G2KeyPair.generate({
    seed,
  });

  const bbsKeyPair: DidWebGeneratedKeyPair = {
    type: VerificationType.Bls12381G2Key2020,
    seed: seed,
    seedBase58: base58btc.encode(seed).slice(1),
    privateKey: keys.privateKeyBuffer,
    privateKeyBase58: keys.privateKey,
    publicKey: keys.publicKeyBuffer,
    publicKeyBase58: keys.publicKey,
  };

  return bbsKeyPair;
};
