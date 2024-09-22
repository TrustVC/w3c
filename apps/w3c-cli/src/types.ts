import { CredentialStatusPurpose, StatusList } from '@tradetrust-tt/w3c-credential-status';
import { VerificationType } from '@tradetrust-tt/w3c-issuer';

export type IssueDidInput = {
  keyPairPath: string;
  domainName: string;
  outputPath: string;
};

export type KeyPairQuestionType = {
  keyPairPath: string;
};

export type CredentialQuestionType = {
  credentialPath: string;
};

export type QuestionType = {
  domainName: string;
  outputPath: string;
};

export type GenerateInput = {
  encAlgo: VerificationType;
  seedBase58: string;
  keyPath: string;
};

export type CredentialStatusQuestionType = {
  type?: string;
  keyPairPath?: string;
  keypairData?: any;
  hostingUrl?: string;
  outputPath?: string;
  length?: number;
  purpose?: CredentialStatusPurpose;
  continue?: boolean;
  index?: number;
  status?: boolean;
  credentialStatus?: StatusList;
};
