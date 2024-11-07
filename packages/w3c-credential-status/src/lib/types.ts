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
  id?: string;
  credentialSubject: VCBitstringCredentialSubject;
};

export type CredentialStatusType = BitstringStatusListCredentialStatusType;
export type CredentialStatusPurpose = BitstringStatusListCredentialStatusPurpose;

export type GeneralCredentialStatus = {
  id: string;
  type: CredentialStatusType;
};

export type BitstringStatusListCredentialStatus = GeneralCredentialStatus & {
  id: string;
  type: CredentialStatusType;
  statusPurpose: CredentialStatusPurpose;
  statusListIndex: string;
  statusListCredential: string;
  // statusSize?: number;
  // statusMessage?: Object;
};

export type RawCredentialStatusVC = {
  '@context': string | string[];
  type: string[];
  issuer: string | Record<string, any>;
  issuanceDate: string;
  validFrom?: string;
  validUntil?: string;
  expirationDate?: string;
  credentialSubject: Record<string, any>;
};

export type SignedCredentialStatusVC = RawCredentialStatusVC & {
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    proofValue: string;
  };
};
