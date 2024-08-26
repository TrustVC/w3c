import { VerificationType } from '../../lib/types';
import { generateKeyPair } from './../keyPair';
import { generateWellKnownDid, nextKeyId } from './generate';
import { queryWellKnownDid } from './query';
import { DidDocumentPrivateKeyPair, IssuedDID, KeyPairType } from './types';

/**
 *  Issue a DID based on the input key pair.
 *
 * @param {KeyPairType} didInput
 * @param {string} didInput.domain - Domain name
 * @param {string} didInput.type - Type of key pair to generate, supported types are Bls12381G2Key2020
 *
 * @param {string} didInput.seedBase58 - Seed in base58 format (optional)
 * @param {string} didInput.privateKeyBase58 - Private key in base58 format (optional)
 * @param {string} didInput.publicKeyBase58 - Public key in base58 format (optional)
 *
 * @param {string} didInput.mnemonics - Mnemonics for did:ethr [EcdsaSecp256k1RecoveryMethod2020] (optional)
 * @param {string} didInput.path - Path for HDWalletNode address for did:ethr [EcdsaSecp256k1RecoveryMethod2020], default "m/44'/60'/0'/0/0" (optional)
 * @param {string} didInput.blockchainAccountId - Public address for did:ethr [EcdsaSecp256k1RecoveryMethod2020] (optional)
 *
 * @returns {Promise<IssuedDID>} - Well known DID document and generated DID key pair
 */
export const issueDID = async (didInput: KeyPairType): Promise<IssuedDID> => {
  const { wellKnownDid, did } = (await queryWellKnownDid(didInput.domain)) ?? {};

  if (wellKnownDid && wellKnownDid.id !== did) {
    throw new Error('Input domain mismatch: ' + wellKnownDid.id + ' !== ' + did);
  }

  const keyId = nextKeyId(wellKnownDid);

  const generatedKeyPair = await generateKeyPair(didInput);

  let keyPairs: DidDocumentPrivateKeyPair = {
    id: `${did}#keys-${keyId}`,
    type: generatedKeyPair.type,
    controller: did,
  };

  if (generatedKeyPair.type === VerificationType.Bls12381G2Key2020) {
    keyPairs = {
      ...keyPairs,
      seedBase58: generatedKeyPair?.seedBase58,
      privateKeyBase58: generatedKeyPair?.privateKeyBase58,
      publicKeyBase58: generatedKeyPair?.publicKeyBase58,
    };
  } else if (generatedKeyPair.type === VerificationType.EcdsaSecp256k1RecoveryMethod2020) {
    keyPairs = {
      ...keyPairs,
      mnemonics: generatedKeyPair?.mnemonics,
      path: generatedKeyPair?.path,
      privateKeyHex: generatedKeyPair?.privateKeyHex,
      blockchainAccountId: generatedKeyPair?.blockchainAccountId,
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
