import {
  CredentialStatusPurpose,
  CredentialStatusType,
} from '@tradetrust-tt/w3c-credential-status';
import { CredentialStatus as GeneralCredentialStatus } from '../../types';

export type BitstringStatusListCredentialStatus = GeneralCredentialStatus & {
  id: string;
  type: CredentialStatusType;
  statusPurpose: CredentialStatusPurpose;
  statusListIndex: string;
  statusListCredential: string;
  // statusSize?: number;
  // statusMessage?: Object;
};

export type CredentialStatus = GeneralCredentialStatus | BitstringStatusListCredentialStatus;

export type CredentialStatusResult = {
  status?: boolean;
  purpose?: CredentialStatusPurpose;
  error?: string;
};
