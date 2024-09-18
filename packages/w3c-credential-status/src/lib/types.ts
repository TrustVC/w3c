import { CredentialSubject as GeneralCredentialSubject } from '@tradetrust-tt/w3c-vc';
import {
  CredentialStatusPurpose,
  CredentialStatusType,
  VCBitstringCredentialSubjectType,
} from './BitstringStatusList/types';

export type VCBitstringCredentialSubject = GeneralCredentialSubject & {
  id?: string;
  type: VCBitstringCredentialSubjectType;
  statusPurpose: CredentialStatusPurpose;
  encodedList: string;
};

export type CreateVCCredentialStatusOptions = {
  id: string;
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

export type CredentialStatusResult = {
  status?: boolean;
  error?: string;
};
