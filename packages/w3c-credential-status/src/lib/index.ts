import { PrivateKeyPair } from '@tradetrust-tt/w3c-issuer';
import {
  CredentialContextVersion,
  RawVerifiableCredential,
  signCredential,
  SigningResult,
  verifyCredential,
} from '@tradetrust-tt/w3c-vc';
import { BBS_V1_URL, STATUS_LIST_2021_CREDENTIAL_URL } from '@tradetrust-tt/w3c-vc/contexts';
import {
  _checkCredentialSubjectForStatusList2021Credential,
  assertStatusListIndexWithinRange,
} from './BitstringStatusList/assertions';
import { StatusList } from './BitstringStatusList/StatusList';
import {
  VCBitstringCredentialSubjectType,
  VCCredentialStatusType,
} from './BitstringStatusList/types';
import {
  _checkCredentialStatus,
  assertStatusPurposeMatches,
  fetchCredentialStatusVC,
} from './helper';
import {
  CreateVCCredentialStatusOptions,
  CredentialStatus,
  CredentialStatusResult,
  VCBitstringCredentialSubject,
} from './types';

export const VCCredentialStatusTypeToVCCredentialSubjectType: Record<
  VCCredentialStatusType,
  VCBitstringCredentialSubjectType
> = {
  StatusList2021Credential: 'StatusList2021',
  BitstringStatusListCredential: 'BitstringStatusList',
};

/**
 * Creates a signed credential status VC.
 * @param {object} options
 * @param {string} options.id - The ID of the credential.
 * @param {object} options.credentialSubject - The credential subject.
 * @param {PrivateKeyPair} keyPair - The key pair options for signing.
 * @param {VCCredentialStatusType} type - The type of the credential status VC. Defaults to 'StatusList2021Credential'.
 * @param {string} cryptoSuite - The cryptosuite to be used for signing. Defaults to 'BbsBlsSignature2020'.
 * @returns {Promise<SigningResult>} The signed credential status VC or an error message in case of failure.
 */
export const createSignedCredentialStatusVC = async (
  options: CreateVCCredentialStatusOptions,
  keyPair: PrivateKeyPair,
  type: VCCredentialStatusType = 'StatusList2021Credential',
  cryptoSuite = 'BbsBlsSignature2020',
): Promise<SigningResult> => {
  try {
    const { id, credentialSubject } = options;

    switch (type) {
      case 'StatusList2021Credential':
        _checkCredentialSubjectForStatusList2021Credential(credentialSubject);
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    if (!credentialSubject.id) {
      credentialSubject.id = `${id}#list`;
    }

    const context = [CredentialContextVersion.v1];

    if (cryptoSuite === 'BbsBlsSignature2020') {
      context.push(BBS_V1_URL);
    }

    if (type === 'StatusList2021Credential') {
      context.push(STATUS_LIST_2021_CREDENTIAL_URL);
    }

    const vc: RawVerifiableCredential = {
      '@context': context,
      id,
      type: ['VerifiableCredential', type],
      issuer: keyPair.controller,
      issuanceDate: new Date().toISOString(),
      validFrom: new Date().toISOString(),
      credentialSubject,
    };

    const signedCredential = await signCredential(vc, keyPair);

    return signedCredential;
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return { error: 'An error occurred while signing the credential status VC.' };
    }
    return { error: err.message };
  }
};

/**
 * Verifies the credential status and returns the status of the given index.
 * @param {CredentialStatus} credentialStatus - The credential status to be verified.
 * @returns {Promise<CredentialStatusResult>} The result of the credential status from the index or an error message in case of failure.
 */
export const verifyCredentialStatus = async (
  credentialStatus: CredentialStatus,
): Promise<CredentialStatusResult> => {
  try {
    const { statusPurpose, statusListIndex, statusListCredential } = credentialStatus ?? {};

    _checkCredentialStatus(credentialStatus);
    const index = Number.parseInt(statusListIndex);

    const vcStatusList = await fetchCredentialStatusVC(statusListCredential);

    const statusList = vcStatusList.credentialSubject as VCBitstringCredentialSubject;
    assertStatusPurposeMatches(statusList, statusPurpose);

    const bitstringStatusList = await StatusList.decode(statusList);

    assertStatusListIndexWithinRange(bitstringStatusList, index);

    // Check if the statusListCredential is valid
    const vcStatusListVerificationResult = await verifyCredential(vcStatusList);
    if (!vcStatusListVerificationResult?.verified) {
      throw new Error(
        `Failed to verify Credential Status VC. Error: "${vcStatusListVerificationResult.error}"`,
      );
    }

    const status = bitstringStatusList.getStatus(index);

    return { status };
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
