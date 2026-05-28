import { generateKeyPair } from '../did-web/keyPair';
import { CryptoSuite, VerificationContext, VerificationType } from '../lib/types';
import { multibaseToDidKey } from './parse';
import { GeneratedDidKey } from './types';

/**
 * Generate a fresh did:key DID + private key pair for one of the supported
 * Multikey cryptosuites (BBS-2023 → BLS12-381 G2, ECDSA-SD-2023 → P-256).
 * Because both libraries produce `publicKeyMultibase` strings that are already
 * multibase+multicodec-encoded, the did:key DID is exactly `did:key:<publicKeyMultibase>`.
 * @param {CryptoSuite} cryptosuite - Either `bbs-2023` or `ecdsa-sd-2023`.
 * @param {object} [options] - Optional generation options.
 * @param {string} [options.seedBase58] - Optional seed for BBS-2023 (ignored for ECDSA-SD-2023).
 * @returns {Promise<GeneratedDidKey>} The new DID and a Multikey private key pair scoped to that DID.
 */
export const generateDidKeyPair = async (
  cryptosuite: CryptoSuite,
  options?: { seedBase58?: string },
): Promise<GeneratedDidKey> => {
  const kp = await generateKeyPair({
    type: cryptosuite,
    seedBase58: options?.seedBase58,
  });

  if (!kp.publicKeyMultibase || !kp.secretKeyMultibase) {
    throw new Error(`generateKeyPair did not return a Multikey key pair for ${cryptosuite}`);
  }

  const info = multibaseToDidKey(kp.publicKeyMultibase);

  return {
    did: info.did,
    didKeyPairs: {
      '@context': VerificationContext[VerificationType.Multikey],
      id: info.verificationMethodId,
      type: VerificationType.Multikey,
      controller: info.did,
      publicKeyMultibase: kp.publicKeyMultibase,
      secretKeyMultibase: kp.secretKeyMultibase,
      ...(kp.seedBase58 && { seedBase58: kp.seedBase58 }),
    },
  };
};
