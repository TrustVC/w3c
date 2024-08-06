import { VerificationType } from "@tradetrust-tt/w3c-issuer";

export type IssueDidInput = {
  keyPairPath: string;
  domainName: string;
  outputPath: string;
};

export type KeyPairQuestionType = {
  keyPairPath: string;
};

export type QuestionType = {
  domainName: string;
  outputPath: string;
};

export const encAlgos: VerificationType[] = [
  VerificationType.Bls12381G2Key2020,
  VerificationType.Ed25519VerificationKey2018,
];

export type GenerateInput = {
  encAlgo: VerificationType;
  seedBase58: string;
  keyPath: string;
};
