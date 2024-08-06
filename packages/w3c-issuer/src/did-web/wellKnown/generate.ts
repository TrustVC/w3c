import { VerificationMethod } from 'did-resolver';
import { DidKeyPair, DidWellKnownDocument, WellKnownAttribute, WellKnownEnum } from './types';

/**
 * Generate well known DID document based on the well known DID document and new key pair.
 *
 * @param {DidWellKnownDocument} wellKnown - Well known DID document
 * @param {DidKeyPair} newKeyPair - New key pair to add to the well known DID document
 * @returns {DidWellKnownDocument} - Updated well known DID document
 */
export const generateWellKnownDid = ({
  wellKnown,
  newKeyPair,
}: {
  wellKnown?: DidWellKnownDocument;
  newKeyPair: DidKeyPair;
}): DidWellKnownDocument | undefined => {
  if (!newKeyPair) {
    return;
  }

  // check if public key already exists
  if (
    wellKnown?.verificationMethod?.find((s) => s?.publicKeyBase58 === newKeyPair?.publicKeyBase58)
  ) {
    throw new Error('Public key already exists');
  }

  if (!wellKnown) {
    wellKnown = {
      id: newKeyPair?.controller,
      [WellKnownEnum.VERIFICATION_METHOD]: [],
      '@context': ['https://www.w3.org/ns/did/v1'],
    };
  }

  // id
  if (!wellKnown.id) {
    wellKnown.id = newKeyPair.controller;
  }

  // Context
  const context = [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/bls12381-2020/v1',
  ];
  if (!wellKnown['@context']) {
    wellKnown['@context'] = context;
  } else {
    if (typeof wellKnown['@context'] === 'string') {
      wellKnown['@context'] = [wellKnown['@context']];
    }
    for (const c of context) {
      if (!wellKnown['@context'].includes(c)) {
        wellKnown['@context'].push(c);
      }
    }
  }

  // Verification Method
  const newVerificationMethod: VerificationMethod = {
    type: newKeyPair.type,
    id: newKeyPair.id,
    controller: newKeyPair.controller,
    publicKeyBase58: newKeyPair.publicKeyBase58,
  };
  if (!wellKnown[WellKnownEnum.VERIFICATION_METHOD]) {
    wellKnown[WellKnownEnum.VERIFICATION_METHOD] = [newVerificationMethod];
  } else if (
    !wellKnown[WellKnownEnum.VERIFICATION_METHOD]?.find((s) => s?.id === newVerificationMethod?.id)
  ) {
    wellKnown[WellKnownEnum.VERIFICATION_METHOD].push(newVerificationMethod);
  } else {
    throw new Error('Key already exists');
  }

  for (const type of WellKnownAttribute) {
    if (!wellKnown[type]) {
      wellKnown[type] = [newVerificationMethod?.id];
    } else {
      if (!wellKnown[type]?.includes(newVerificationMethod?.id))
        wellKnown[type].push(newVerificationMethod?.id);
    }
  }

  return wellKnown;
};

/**
 * Find next unique key id based on the well known DID document.
 *
 * @param {DidWellKnownDocument} wellKnown
 */
export const nextKeyId = (wellKnown: DidWellKnownDocument): number => {
  // Filter for all key id
  const keyIds = wellKnown?.verificationMethod?.map((s) => s?.id) ?? [];

  // strip the key id to get the number
  const keyIdNumbers = keyIds.map((s) => {
    const parts = s?.split('#');
    if (!parts) return 0;
    return parts?.[parts.length - 1]?.split('keys-')?.[1];
  });

  // filter out the non-numeric values using Number and convert to number
  const keyIdNumbersFiltered = keyIdNumbers
    .filter((s) => !Number.isInteger(s))
    .map((s) => Number(s));

  // get the max number
  if (keyIdNumbersFiltered.length === 0) return 1;
  const maxKeyId = Math.max(...keyIdNumbersFiltered);

  return maxKeyId + 1;
};
