import { Bls12381G2KeyPair } from '@mattrglobal/bls12381-key-pair';
import { base58btc } from 'multiformats/bases/base58';
import {
  GeneratedKeyPair,
  GenerateKeyPairOptions,
  VerificationType
} from './types';

/**
 * Generate Bls12381 key pair based on the seed.
 *
 * @param {Uint8Array} seed - Seed to generate the key pair
 * @returns {Promise<GeneratedKeyPair>} - Generated Bls12381 key pair
 */
export const generateBls12381KeyPair = async ({
  seed,
}: GenerateKeyPairOptions): Promise<GeneratedKeyPair> => {
  if (!seed) {
    throw new Error('Invalid seed');
  }

  // const bbsKeyPair = await generateBls12381G2KeyPair(seed)

  // Transmute
  // const keys = await bls12381.Bls12381KeyPairs.generate({
  //   secureRandom: () => {
  //     return seed;
  //   },
  // });

  // const g2KeyPair = (await keys.g2KeyPair.export({
  //   type: 'Bls12381G2Key2020',
  //   privateKey: true,
  // })) as Bls12381G2Key2020;

  // const bbsKeyPair: GeneratedKeyPair = {
  //   type: VerificationType.Bls12381G2Key2020,
  //   seed: seed,
  //   seedBase58: base58btc.encode(seed!).slice(1),
  //   privateKey: keys.g2KeyPair.privateKey,
  //   privateKeyBase58: g2KeyPair.privateKeyBase58,
  //   publicKey: keys.g2KeyPair.publicKey,
  //   publicKeyBase58: g2KeyPair.publicKeyBase58,
  // };

  // MattrGlobal
  const keys = await Bls12381G2KeyPair.generate({
    seed,
  });

  const bbsKeyPair: GeneratedKeyPair = {
    type: VerificationType.Bls12381G2Key2020,
    seed: seed,
    seedBase58: base58btc.encode(seed!).slice(1),
    privateKey: keys.privateKeyBuffer,
    privateKeyBase58: keys.privateKey,
    publicKey: keys.publicKeyBuffer,
    publicKeyBase58: keys.publicKey,
  };

  return bbsKeyPair;
};
