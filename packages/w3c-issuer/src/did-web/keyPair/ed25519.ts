import * as ed25519 from '@transmute/did-key-ed25519';
import { Ed25519VerificationKey2018 } from '@transmute/ed25519-key-pair';
import { base58btc } from 'multiformats/bases/base58';
import {
  GeneratedKeyPair,
  GenerateKeyPairOptions,
  VerificationType
} from './types';

/**
 * Generate Ed25519 key pair based on the seed.
 *
 * @param {Uint8Array} seed - Seed to generate the key pair
 * @returns {Promise<GeneratedKeyPair>} - Generated Ed25519 key pair
 */
export const generateEd25519KeyPair = async ({
  seed,
}: Readonly<GenerateKeyPairOptions>): Promise<GeneratedKeyPair> => {
  if (!seed) {
    throw new Error('Invalid seed');
  }

  const keys = await ed25519.Ed25519KeyPair.generate({
    secureRandom: () => {
      return seed!;
    },
  });

  const edKeyPair = (await keys.export({
    type: 'Ed25519VerificationKey2018',
    privateKey: true,
  })) as Ed25519VerificationKey2018;

  return {
    type: VerificationType.Ed25519VerificationKey2018,
    seed,
    seedBase58: base58btc.encode(seed!).slice(1),
    privateKey: keys.privateKey,
    privateKeyBase58: edKeyPair.privateKeyBase58,
    publicKey: keys.publicKey,
    publicKeyBase58: edKeyPair.publicKeyBase58,
  };
};
