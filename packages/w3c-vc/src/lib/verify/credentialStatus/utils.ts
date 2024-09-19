import {
  assertAllowedStatusPurpose,
  assertCredentialStatusType,
  assertStatusListIndex,
} from '@tradetrust-tt/w3c-credential-status';
import { SignedVerifiableCredential } from '../../types';
import { BitstringStatusListCredentialStatus, CredentialStatus } from './types';

/**
 * Fetches the verifiable credential of the credential status.
 * @param {string} url - The URL of the statusListCredential.
 * @returns {Promise<SignedVerifiableCredential>} The verifiable credential of the credential status.
 */
export const fetchCredentialStatusVC = async (url: string): Promise<SignedVerifiableCredential> => {
  // Check statusListCredential is valid e.g. URL
  if (!url || !URL.canParse(url)) {
    throw new Error(`Invalid statusListCredential: "${url}"`);
  }

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { Accept: 'application/*' },
    });
    const result: SignedVerifiableCredential = await response.json();

    return result;
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      throw new Error(`Failed to fetch Credential Status VC`);
    }
    throw new Error(`Credential Status VC not found: ${err?.message}`);
  }
};

/**
 * Asserts the credential status is valid.
 * @param credentialStatus - The credential status to be verified.
 * @throws {Error} - Throws an error if the credential status is invalid.
 */
export const _checkCredentialStatus = (credentialStatus: CredentialStatus): void => {
  const { type, statusPurpose, statusListIndex } =
    (credentialStatus as BitstringStatusListCredentialStatus) ?? {};

  assertCredentialStatusType(type);

  assertAllowedStatusPurpose(statusPurpose);

  assertStatusListIndex(statusListIndex);
};
