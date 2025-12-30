import { VerificationType, VerificationContext } from '../../lib/types';
import { generateKeyPair } from './../keyPair';
import { generateWellKnownDid, nextKeyId } from './generate';
import { queryDidDocument } from './query';
import { PrivateKeyPair, IssuedDID, IssuedDIDOption } from './types';

/**
 *  Issue a DID based on the input key pair.
 *
 * @param {IssuedDIDOption} didInput
 * @param {string} didInput.domain - Domain name
 * @param {string} didInput.type - Type of key pair to generate, supported types are Bls12381G2Key2020, EcdsaSecp256k1RecoveryMethod2020, Bbs2023, EcdsaSd2023
 *
 * @param {string} didInput.seedBase58 - Seed in base58 format (optional, for BLS and BBS-2023)
 * @param {string} didInput.privateKeyBase58 - Private key in base58 format (optional, for BLS)
 * @param {string} didInput.publicKeyBase58 - Public key in base58 format (optional, for BLS)
 *
 * @param {string} didInput.mnemonics - Mnemonics for did:ethr [EcdsaSecp256k1RecoveryMethod2020] (optional)
 * @param {string} didInput.path - Path for HDWalletNode address for did:ethr [EcdsaSecp256k1RecoveryMethod2020], default "m/44'/60'/0'/0/0" (optional)
 * @param {string} didInput.blockchainAccountId - Public address for did:ethr [EcdsaSecp256k1RecoveryMethod2020] (optional)
 *
 * @returns {Promise<IssuedDID>} - Well known DID document and generated DID key pair
 */
export const issueDID = async (didInput: IssuedDIDOption): Promise<IssuedDID> => {
  const { wellKnownDid, did } = (await queryDidDocument({ domain: didInput?.domain })) ?? {};

  if (wellKnownDid && wellKnownDid.id !== did) {
    throw new Error('Input domain mismatch: ' + wellKnownDid.id + ' !== ' + did);
  }

  const keyId = nextKeyId(wellKnownDid);

  // Check if user provided public key data
  const hasModernPublicKey = didInput.publicKeyMultibase;
  const hasLegacyPublicKey = didInput.publicKeyBase58;
  const userProvidedKeys = hasModernPublicKey || hasLegacyPublicKey;

  // Validate that type is provided when keys are provided
  if (userProvidedKeys && !didInput.type) {
    throw new Error('Key pair type must be provided when supplying existing keys');
  }

  // Only generate if user didn't provide complete key pair
  const generatedKeyPair = userProvidedKeys ? { ...didInput } : await generateKeyPair(didInput);

  let keyPairs: PrivateKeyPair;

  if (generatedKeyPair.type === VerificationType.Bls12381G2Key2020) {
    // Legacy BLS
    keyPairs = {
      id: `${did}#keys-${keyId}`,
      type: VerificationType.Bls12381G2Key2020,
      controller: did,
      seedBase58: generatedKeyPair?.seedBase58,
      privateKeyBase58: generatedKeyPair?.privateKeyBase58,
      publicKeyBase58: generatedKeyPair?.publicKeyBase58,
    };
  } else if (generatedKeyPair.type === VerificationType.Multikey) {
    // Modern cryptosuites (BBS-2023, ECDSA-SD-2023)
    keyPairs = {
      '@context': VerificationContext[VerificationType.Multikey],
      id: `${did}#keys-${keyId}`,
      type: VerificationType.Multikey,
      controller: did,
      secretKeyMultibase: generatedKeyPair?.secretKeyMultibase,
      publicKeyMultibase: generatedKeyPair?.publicKeyMultibase,
      ...(generatedKeyPair?.seedBase58 && { seedBase58: generatedKeyPair.seedBase58 }), // Only for BBS-2023
    };
  }

  const generatedWellKnownDid = generateWellKnownDid({
    wellKnown: wellKnownDid,
    newKeyPair: keyPairs,
  });

  return {
    wellKnownDid: generatedWellKnownDid,
    didKeyPairs: keyPairs,
  };
};
