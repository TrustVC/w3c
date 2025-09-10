import {
  assertStatusListIndexWithinRange,
  assertStatusPurposeMatches,
  BitstringStatusListCredentialStatus,
  CredentialStatusType,
  fetchCredentialStatusVC,
  StatusList,
  VCBitstringCredentialSubject,
} from '@trustvc/w3c-credential-status';
import { _checkCredentialStatus } from '../../helper';
import { CredentialStatus, CredentialStatusResult } from './types';
import { deriveCredential, verifyCredential } from '../../w3c-vc';
import { SignedVerifiableCredential } from '../../types';
import { DocumentLoader } from '@trustvc/w3c-context';

/**
 * Verifies the credential status and returns the status of the given index.
 * @param {BitstringStatusListCredentialStatus} credentialStatus - The credential status to be verified.
 * @returns {Promise<CredentialStatusResult>} The result of the credential status from the index or an error message in case of failure.
 */
export const verifyCredentialStatus = async (
  credentialStatus: CredentialStatus,
  type: CredentialStatusType = 'StatusList2021Entry',
  options?: {
    documentLoader?: DocumentLoader;
  },
): Promise<CredentialStatusResult> => {
  try {
    _checkCredentialStatus(credentialStatus, 'verify');

    if (!['BitstringStatusListEntry', 'StatusList2021Entry'].includes(type)) {
      return {
        error: 'Invalid credential status type. Expected BitstringStatusListCredentialStatus',
      };
    }

    const { statusPurpose, statusListIndex, statusListCredential } =
      (credentialStatus as BitstringStatusListCredentialStatus) ?? {};

    const index = Number.parseInt(statusListIndex);

    const vcStatusList: SignedVerifiableCredential = await fetchCredentialStatusVC(
      statusListCredential,
      options?.documentLoader,
    );

    const statusList = vcStatusList.credentialSubject as VCBitstringCredentialSubject;
    assertStatusPurposeMatches(statusList, statusPurpose);

    const bitstringStatusList = await StatusList.decode(statusList);

    assertStatusListIndexWithinRange(bitstringStatusList, index);

    // Check if the statusListCredential is valid
    const DERIVE_CREDENTIAL_ERROR = 'Use deriveCredential() first';
    let vcStatusListVerificationResult = await verifyCredential(vcStatusList, options);

    // Handle ECDSA-SD-2023 base credentials that need derivation before verification
    if (
      !vcStatusListVerificationResult?.verified &&
      vcStatusListVerificationResult.error?.includes(DERIVE_CREDENTIAL_ERROR)
    ) {
      const derivedResult = await deriveCredential(vcStatusList, []);
      vcStatusListVerificationResult = await verifyCredential(derivedResult.derived, options);
    }

    // Throw error if verification still fails
    if (!vcStatusListVerificationResult?.verified) {
      const errorMessage = `Failed to verify Credential Status VC: ${vcStatusListVerificationResult.verified}`;
      const detailedError = vcStatusListVerificationResult.error
        ? `. Error: ${vcStatusListVerificationResult.error}`
        : '';

      console.error(errorMessage + detailedError);
      throw new Error(errorMessage);
    }

    const status = bitstringStatusList.getStatus(index);

    return {
      status,
      purpose: statusPurpose,
    };
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return { error: 'An error occurred while verifying the credential status.' };
    }
    if (err.message.includes('Could not decode encoded status list; reason:')) {
      return { error: `Invalid encodedList: encodedList cannot be decoded` };
    }
    return { error: err.message };
  }
};
