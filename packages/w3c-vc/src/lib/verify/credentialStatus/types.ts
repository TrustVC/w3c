import {
  BitstringStatusListCredentialStatus,
  CredentialStatusPurpose,
} from '@tradetrust-tt/w3c-credential-status';
import { CredentialStatus as GeneralCredentialStatus } from '../../types';

export type CredentialStatus = GeneralCredentialStatus | BitstringStatusListCredentialStatus;

export type CredentialStatusResult = {
  status?: boolean;
  purpose?: CredentialStatusPurpose;
  error?: string;
};
