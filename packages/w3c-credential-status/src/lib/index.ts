import {
  CredentialContextVersion,
  DATA_INTEGRITY_V2_URL,
  STATUS_LIST_2021_CREDENTIAL_URL,
} from '@trustvc/w3c-context';
import { PrivateKeyPair } from '@trustvc/w3c-issuer';
import {
  _checkCredentialSubjectForStatusList2021Credential,
  _checkCredentialSubjectForBitstringStatusListCredential,
} from './BitstringStatusList/assertions';
import {
  VCBitstringCredentialSubjectType,
  VCCredentialStatusType,
} from './BitstringStatusList/types';
import {
  CreateVCCredentialStatusOptions,
  CryptoSuiteName,
  GeneralCredentialStatus,
  RawCredentialStatusVC,
} from './types';
import {
  assertCredentialStatusStatusListType,
  getValidFromDateFromCredentialStatusVC,
} from './utils';

export const VCCredentialStatusTypeToVCCredentialSubjectType: Record<
  VCCredentialStatusType,
  VCBitstringCredentialSubjectType
> = {
  StatusList2021Credential: 'StatusList2021',
  BitstringStatusListCredential: 'BitstringStatusList',
};

/**
 * Creates a credential status VC payload.
 * @param {object} options
 * @param {string} options.id - The ID of the credential.
 * @param {object} options.credentialSubject - The credential subject.
 * @param {PrivateKeyPair} keyPair - The key pair options for signing.
 * @param {VCCredentialStatusType} type - The type of the credential status VC. Defaults to 'BitstringStatusListCredential'.
 * @param {CryptoSuiteName} cryptoSuite - The cryptosuite to be used for signing. Defaults to 'ecdsa-sd-2023'.
 * @returns {Promise<RawCredentialStatusVC>}
 */
export const createCredentialStatusPayload = async (
  options: CreateVCCredentialStatusOptions,
  keyPair: PrivateKeyPair,
  type: VCCredentialStatusType = 'BitstringStatusListCredential',
  cryptoSuite: CryptoSuiteName = 'ecdsa-sd-2023',
): Promise<RawCredentialStatusVC> => {
  try {
    const { id, credentialSubject } = options;

    if (cryptoSuite === 'BbsBlsSignature2020') {
      throw new Error(
        'BbsBlsSignature2020 is no longer supported. Please use the latest cryptosuite versions instead.',
      );
    }

    switch (type) {
      case 'StatusList2021Credential':
        _checkCredentialSubjectForStatusList2021Credential(credentialSubject);
        break;
      case 'BitstringStatusListCredential':
        _checkCredentialSubjectForBitstringStatusListCredential(credentialSubject);
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    if (!credentialSubject.id && id) {
      credentialSubject.id = `${id}#list`;
    }

    // Determine version based on credential type
    const isV2 = type === 'BitstringStatusListCredential';
    const context = [isV2 ? CredentialContextVersion.v2 : CredentialContextVersion.v1];
    context.push(DATA_INTEGRITY_V2_URL);

    // Add status list context only for v1.1 (v2.0 has it built-in)
    if (type === 'StatusList2021Credential') {
      context.push(STATUS_LIST_2021_CREDENTIAL_URL);
    }

    const validFrom = await getValidFromDateFromCredentialStatusVC(id);

    const vc: RawCredentialStatusVC = {
      '@context': context,
      type: ['VerifiableCredential', type],
      issuer: keyPair.controller,
      ...(isV2
        ? { validFrom }
        : {
            issuanceDate: new Date().toISOString(),
            validFrom,
          }),
      credentialSubject,
    };

    return vc;
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      throw new Error('An error occurred while signing the credential status VC.');
    }
    throw err;
  }
};

/**
 * Checks if the input credential status is a StatusList2021Credential / BitstringStatusListCredential.
 * @param {GeneralCredentialStatus} credentialStatus - The credential status to be checked.
 * @returns {boolean} - Returns true if the credential status is a StatusList2021Credential / BitstringStatusListCredential, false otherwise.
 */
export const isCredentialStatusStatusList = (
  credentialStatus: GeneralCredentialStatus,
): boolean => {
  try {
    assertCredentialStatusStatusListType(credentialStatus?.type);
    return true;
  } catch (err) {
    return false;
  }
};
