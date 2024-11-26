import {
  BBS_V1_URL,
  CredentialContextVersion,
  STATUS_LIST_2021_CREDENTIAL_URL,
} from '@trustvc/w3c-context';
import { PrivateKeyPair } from '@trustvc/w3c-issuer';
import { _checkCredentialSubjectForStatusList2021Credential } from './BitstringStatusList/assertions';
import {
  VCBitstringCredentialSubjectType,
  VCCredentialStatusType,
} from './BitstringStatusList/types';
import { CreateVCCredentialStatusOptions, RawCredentialStatusVC } from './types';
import { getValidFromDateFromCredentialStatusVC } from './utils';

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
 * @param {VCCredentialStatusType} type - The type of the credential status VC. Defaults to 'StatusList2021Credential'.
 * @param {string} cryptoSuite - The cryptosuite to be used for signing. Defaults to 'BbsBlsSignature2020'.
 * @returns {Promise<RawCredentialStatusVC>}
 */
export const createCredentialStatusPayload = async (
  options: CreateVCCredentialStatusOptions,
  keyPair: PrivateKeyPair,
  type: VCCredentialStatusType = 'StatusList2021Credential',
  cryptoSuite = 'BbsBlsSignature2020',
): Promise<RawCredentialStatusVC> => {
  try {
    const { id, credentialSubject } = options;

    switch (type) {
      case 'StatusList2021Credential':
        _checkCredentialSubjectForStatusList2021Credential(credentialSubject);
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    if (!credentialSubject.id && id) {
      credentialSubject.id = `${id}#list`;
    }

    const context = [CredentialContextVersion.v1];

    if (cryptoSuite === 'BbsBlsSignature2020') {
      context.push(BBS_V1_URL);
    }

    if (type === 'StatusList2021Credential') {
      context.push(STATUS_LIST_2021_CREDENTIAL_URL);
    }

    const validFrom = await getValidFromDateFromCredentialStatusVC(id);

    const vc: RawCredentialStatusVC = {
      '@context': context,
      type: ['VerifiableCredential', type],
      issuer: keyPair.controller,
      issuanceDate: new Date().toISOString(),
      validFrom,
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
