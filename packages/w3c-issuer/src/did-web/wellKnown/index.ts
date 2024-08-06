import { getDomainHostname } from '@/tradetrust-tt/w3c-utils';
import { generateKeyPair } from './../keyPair';
import { generateWellKnownDid, nextKeyId } from './generate';
import { queryWellKnownDid } from './query';
import { DidPrivateKeyPair, IssuedDID, KeyPairType } from './types';

/**
 *  Issue a DID based on the input key pair.
 *
 * @param {KeyPairType} didInput
 * @param {string} didInput.domain - Domain name
 * @param {string} didInput.type - Type of key pair to generate, supported types are Bls12381G2Key2020
 * @param {string} didInput.seedBase58 - Seed in base58 format (optional)
 * @param {string} didInput.privateKeyBase58 - Private key in base58 format (optional)
 * @param {string} didInput.publicKeyBase58 - Public key in base58 format (optional)
 * @returns {Promise<IssuedDID>} - Well known DID document and generated DID key pair
 */
export const issueDID = async (didInput: KeyPairType): Promise<IssuedDID> => {
  let wellKnownDid = await queryWellKnownDid(didInput.domain);

  const domainHostname = getDomainHostname(didInput?.domain);
  const did = `did:web:${domainHostname}`;

  const keyId = nextKeyId(wellKnownDid);

  const generatedKeyPair = await generateKeyPair(didInput);

  const keyPairs: DidPrivateKeyPair = {
    id: `${did}#keys-${keyId}`,
    type: generatedKeyPair.type,
    controller: did,
    seedBase58: generatedKeyPair.seedBase58,
    privateKeyBase58: generatedKeyPair.privateKeyBase58,
    publicKeyBase58: generatedKeyPair.publicKeyBase58,
  };

  wellKnownDid = generateWellKnownDid({
    wellKnown: wellKnownDid,
    newKeyPair: keyPairs,
  });

  return {
    wellKnownDid,
    didKeyPairs: keyPairs,
  };
};
