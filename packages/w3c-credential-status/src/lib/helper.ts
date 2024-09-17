import { SignedVerifiableCredential } from '@tradetrust-tt/w3c-vc';
import {
  assertAllowedStatusPurpose,
  isNonNegativeInteger,
  isNumber,
} from './BitstringStatusList/assertions';
import { CredentialStatusPurpose, CredentialStatusType } from './BitstringStatusList/types';
import { CredentialStatus, VCBitstringCredentialSubject } from './types';

/**
 * Fetches the verifiable credential of the credential status.
 * @param {string} url - The URL of the statusListCredential.
 * @returns {Promise<SignedVerifiableCredential>} The verifiable credential of the credential status.
 */
export const fetchCredentialStatusVC = async (url: string): Promise<SignedVerifiableCredential> => {
  // Check statusListCredential is valid e.g. URL
  if (!url || !URL.canParse(url)) {
    throw new Error(`Invalid statusListCredential: ${url}`);
  }

  const response = await fetch(url, {
    redirect: 'follow',
    headers: { Accept: 'application/*' },
  });
  const result: SignedVerifiableCredential = await response.json();

  return result;
};

/**
 * Asserts the type of the credential status.
 * @param type - The type of the credential status.
 * @throws {Error} - Throws an error if the type is not supported.
 */
export const assertCredentialStatusType = (type: CredentialStatusType): void => {
  const supportedTypes: CredentialStatusType[] = ['StatusList2021Entry'];

  if (!supportedTypes.includes(type)) {
    throw new Error(`Unsupported type: ${type}`);
  }
};

/**
 * Asserts the statusListIndex is a valid number.
 * @param statusListIndex - The index of the statusList in the statusListCredential.
 * @throws {Error} - Throws an error if the statusListIndex is not a valid number.
 */
export const assertStatusListIndex = (statusListIndex: string): void => {
  try {
    const index = Number.parseInt(statusListIndex);
    isNumber(index, 'statusListIndex');
    isNonNegativeInteger(index, 'statusListIndex');
  } catch (err) {
    throw new Error(`Invalid statusListIndex: Invalid Number: '${statusListIndex}'`);
  }
};

/**
 * Asserts the statusPurpose matches.
 * @param statusList - The statusList within the Credential Status VC.
 * @param statusPurpose - The credentialStatus.statusPurpose in the verifying VC.
 */
export const assertStatusPurposeMatches = (
  statusList: VCBitstringCredentialSubject,
  statusPurpose: CredentialStatusPurpose,
): void => {
  // Check if statusPurpose matches the statusPurpose in the VC
  if (statusList.statusPurpose !== statusPurpose) {
    throw new Error(`statusPurpose does not match the statusPurpose in the statusListCredential`);
  }
};

/**
 * Asserts the credential status is valid.
 * @param credentialStatus - The credential status to be verified.
 * @throws {Error} - Throws an error if the credential status is invalid.
 */
export const _checkCredentialStatus = (credentialStatus: CredentialStatus): void => {
  const { type, statusPurpose, statusListIndex } = credentialStatus ?? {};

  assertCredentialStatusType(type);

  assertAllowedStatusPurpose(statusPurpose);

  assertStatusListIndex(statusListIndex);
};
