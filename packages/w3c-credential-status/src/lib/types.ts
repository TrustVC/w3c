import {
  CredentialStatusPurpose as BitstringStatusListCredentialStatusPurpose,
  CredentialStatusType as BitstringStatusListCredentialStatusType,
  VCBitstringCredentialSubjectType,
} from './BitstringStatusList/types';

export type VCBitstringCredentialSubject = {
  id?: string;
  type: VCBitstringCredentialSubjectType;
  statusPurpose: BitstringStatusListCredentialStatusPurpose;
  encodedList: string;
};

export type CreateVCCredentialStatusOptions = {
  id: string;
  credentialSubject: VCBitstringCredentialSubject;
};

export type CredentialStatusType = BitstringStatusListCredentialStatusType;
export type CredentialStatusPurpose = BitstringStatusListCredentialStatusPurpose;

export type RawCredentialStatusVC = {
  '@context': string | string[];
  id: string;
  type: string[];
  issuer: string | Record<string, any>;
  issuanceDate: string;
  validFrom?: string;
  validUntil?: string;
  expirationDate?: string;
  credentialSubject: Record<string, any>;
};
