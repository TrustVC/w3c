import { PrivateKeyPair, VerificationType } from '@tradetrust-tt/w3c-issuer';
import {
  CredentialSubject as GeneralCredentialSubject,
  RawVerifiableCredential,
  signCredential,
  SignedVerifiableCredential,
  SigningResult,
  verifyCredential,
} from '@tradetrust-tt/w3c-vc';
import { Bitstring } from './Bitstring/Bitstring';
import { BitstringStatusList } from './Bitstring/StatusList';

export type VCCredentialStatusType = 'BitstringStatusListCredential' | 'StatusList2021Credential';
export type VCBitstringCredentialSubjectType = 'BitstringStatusList' | 'StatusList2021';
export type VCCredentialSubjectType = VCBitstringCredentialSubjectType;

export type CredentialStatusType = 'BitstringStatusListEntry' | 'StatusList2021Entry';
export type CredentialStatusPurpose = 'revocation' | 'suspension' | 'message';

export const VCCredentialStatusTypeToVCCredentialSubjectType: Record<
  VCCredentialStatusType,
  VCBitstringCredentialSubjectType
> = {
  StatusList2021Credential: 'StatusList2021',
  BitstringStatusListCredential: 'BitstringStatusList',
};

export type VCBitstringCredentialSubject = GeneralCredentialSubject & {
  id: string;
  type: VCBitstringCredentialSubjectType[];
  statusPurpose: CredentialStatusPurpose;
  encodedList: string;
};

export type CreateVCCredentialStatusOptions = {
  id: string; // URL: https://didrp-test.esatus.com/credentials/statuslist/1
  type: VCCredentialStatusType;
  credentialSubject: VCBitstringCredentialSubject;
};

export const credentialVersion = {
  v1: 'https://www.w3.org/2018/credentials/v1',
  v2: 'https://www.w3.org/ns/credentials/v2',
};

export type CredentialStatus = GeneralCredentialSubject & {
  id: string;
  type: CredentialStatusType;
  statusPurpose: CredentialStatusPurpose;
  statusListIndex: string;
  statusListCredential: string;
  // statusSize?: Number;
  // statusMessage?: Object;
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
  const { id, type, statusPurpose, statusListIndex, statusListCredential } = credentialStatus ?? {};

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
    throw new Error(`Invalid statusListIndex: ${statusListIndex}`);
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
    throw new Error(`Failed to verify statusListCredential: ${statusListCredential}`);
  }

  const statusList: VCBitstringCredentialSubject =
    vcStatusList.credentialSubject as VCBitstringCredentialSubject;

  // @ts-ignore: No types available for @digitalbazaar/bitstring
  const bitstringStatusList = await BitstringStatusList.decode(statusList);

  return bitstringStatusList.getStatus(index);
};

const main = async () => {
  const bitstringStatusList = new BitstringStatusList({ length: 131000 });

  const privateKeyPair: PrivateKeyPair = {
    id: 'did:web:nghaninn.github.io:did:1#keys-1',
    controller: 'did:web:nghaninn.github.io:did:1',
    type: VerificationType.Bls12381G2Key2020,
    seedBase58: 'GW1FUS9Xg7T6xsZDCVx48EM1uuo25k435U77ftZrQEYB',
    privateKeyBase58: '5LbHsFCpW4YzCNWbqhZJkWyVnayp5gEDsUvrq47qLSN6',
    publicKeyBase58:
      'rDAqEpT2FJspbHL9gM1utkT2UNADn59HMiouSLoktZw8B1GsKyXB3Wd5fgDucCbMDRLcQhWHEuQrrKSf7P2NyqgFwHGbzNQ9X8EPbXakSr2cbqLghmzkGvE4ppEHVkBYc83',
  };

  const options: CreateVCCredentialStatusOptions = {
    id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json',
    type: 'StatusList2021Credential',
    credentialSubject: {
      id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json#list',
      type: ['StatusList2021'],
      statusPurpose: 'revocation',
      encodedList: await bitstringStatusList.encode(),
    },
  };

  const credentialStatusVC = await createCredentialStatusVC(options, privateKeyPair);
  console.log('🚀 ~ main ~ credentialStatusVC:', JSON.stringify(credentialStatusVC, null, 2));

  const credentialStatus = {
    id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json#1',
    type: 'StatusList2021Entry' as CredentialStatusType,
    statusPurpose: 'revocation' as CredentialStatusPurpose,
    statusListIndex: '1',
    statusListCredential: 'https://nghaninn.github.io/did/credentials/statuslist/1.json',
  };
  console.log('🚀 ~ main ~ credentialStatus:', credentialStatus);

  const verified = await verifyCredentialStatus(credentialStatus);
  console.log('🚀 ~ main ~ verified:', verified);
};

main();
