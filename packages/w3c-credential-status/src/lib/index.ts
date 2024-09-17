import { PrivateKeyPair } from '@tradetrust-tt/w3c-issuer';
import {
  RawVerifiableCredential,
  signCredential,
  SignedVerifiableCredential,
  SigningResult,
  verifyCredential,
} from '@tradetrust-tt/w3c-vc';
import { StatusList } from './BitstringStatusList/StatusList';
import {
  CreateVCCredentialStatusOptions,
  CredentialStatus,
  VCBitstringCredentialSubject,
  VCBitstringCredentialSubjectType,
  VCCredentialStatusType,
} from './types';

export const VCCredentialStatusTypeToVCCredentialSubjectType: Record<
  VCCredentialStatusType,
  VCBitstringCredentialSubjectType
> = {
  StatusList2021Credential: 'StatusList2021',
  BitstringStatusListCredential: 'BitstringStatusList',
};

export const credentialVersion = {
  v1: 'https://www.w3.org/2018/credentials/v1',
  v2: 'https://www.w3.org/ns/credentials/v2',
};

export const createCredentialStatusVC = async (
  options: CreateVCCredentialStatusOptions,
  keyPair: PrivateKeyPair,
): Promise<SigningResult> => {
  const { type, id, credentialSubject } = options;

  switch (type) {
    case 'StatusList2021Credential':
      if (
        !credentialSubject.type &&
        !credentialSubject.type?.includes(VCCredentialStatusTypeToVCCredentialSubjectType[type])
      ) {
        throw new Error(`Invalid type for credentialSubject: ${credentialSubject.type}`);
      }
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  if (!credentialSubject.id) {
    credentialSubject.id = `${id}#list`;
  }

  if (!credentialSubject.type) {
    credentialSubject.type = [
      VCCredentialStatusTypeToVCCredentialSubjectType[type],
    ] as VCBitstringCredentialSubjectType[];
  }

  const context = [credentialVersion['v1'], 'https://w3id.org/security/bbs/v1'];

  if (type === 'StatusList2021Credential') {
    context.push('https://w3id.org/vc/status-list/2021/v1');
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
  console.log('🚀 ~ createCredentialStatusVC ~ vc:', vc);

  const signedCredential = await signCredential(vc, keyPair);

  return signedCredential;
};

export const verifyCredentialStatus = async (
  credentialStatus: CredentialStatus,
): Promise<boolean> => {
  const { type, statusPurpose, statusListIndex, statusListCredential } = credentialStatus ?? {};

  // Check type is supported
  switch (type) {
    case 'StatusList2021Entry':
      break;
    default:
      throw new Error(`Unsupported type: ${credentialStatus.type}`);
  }

  // Check statusPurpose is supported
  switch (statusPurpose) {
    case 'revocation':
    case 'suspension':
      break;
    default:
      throw new Error(`Unsupported statusPurpose: ${credentialStatus.statusPurpose}`);
  }

  // Check statusListIndex is valid, e.g. number greater than or equal to 0
  const index = Number.parseInt(statusListIndex);
  if (!index && index !== 0) {
    throw new Error(`Invalid statusListIndex: Invalid Number: ${statusListIndex}`);
  }

  // Check statusListCredential is valid e.g. URL
  if (!statusListCredential || !URL.canParse(statusListCredential)) {
    throw new Error(`Invalid statusListCredential: ${statusListCredential}`);
  }

  const vcStatusListResp = await fetch(statusListCredential, {
    redirect: 'follow',
    headers: { Accept: 'application/*' },
  });
  const vcStatusList: SignedVerifiableCredential = await vcStatusListResp.json();

  const vcStatusListVerificationResult = await verifyCredential(vcStatusList);

  if (!vcStatusListVerificationResult?.verified) {
    console.error(
      `Failed to verify Credential Status - Verifiable Credential: ${vcStatusListVerificationResult.verified}. Error: ${vcStatusListVerificationResult.error}`,
    );
    throw new Error(
      `Failed to verify Credential Status - Verifiable Credential: ${vcStatusListVerificationResult.verified}`,
    );
  }

  const statusList: VCBitstringCredentialSubject =
    vcStatusList.credentialSubject as VCBitstringCredentialSubject;

  const bitstringStatusList = await StatusList.decode(statusList);

  // Check if statusListIndex is within the range of the bitstringStatusList
  if (bitstringStatusList.length <= index || index < 0) {
    throw new Error(`Invalid statusListIndex: Index out of range: ${statusListIndex}`);
  }

  return bitstringStatusList.getStatus(index);
};
