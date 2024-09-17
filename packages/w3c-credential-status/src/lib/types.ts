import { CredentialSubject as GeneralCredentialSubject } from '@tradetrust-tt/w3c-vc';

export type VCCredentialStatusType = 'BitstringStatusListCredential' | 'StatusList2021Credential';
export type VCBitstringCredentialSubjectType = 'BitstringStatusList' | 'StatusList2021';
export type VCCredentialSubjectType = VCBitstringCredentialSubjectType;

export type CredentialStatusType = 'BitstringStatusListEntry' | 'StatusList2021Entry';
export type CredentialStatusPurpose = 'revocation' | 'suspension' | 'message';

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

export type CredentialStatus = GeneralCredentialSubject & {
  id: string;
  type: CredentialStatusType;
  statusPurpose: CredentialStatusPurpose;
  statusListIndex: string;
  statusListCredential: string;
  // statusSize?: number;
  // statusMessage?: Object;
};
