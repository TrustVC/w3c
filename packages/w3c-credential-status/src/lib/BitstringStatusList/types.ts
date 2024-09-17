/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 * Implementing @digitalbazaar/vc-bitstring-status-list
 */
export type BitstringType = {
  length?: number;
  buffer?: Uint8Array;
  leftToRightIndexing?: boolean;
  littleEndianBits?: boolean;
};

export type BitstringStatusListOption = {
  length?: number;
  buffer?: Buffer;
};
export type VCCredentialStatusType = 'BitstringStatusListCredential' | 'StatusList2021Credential';
export type VCBitstringCredentialSubjectType = 'BitstringStatusList' | 'StatusList2021';
export type VCCredentialSubjectType = VCBitstringCredentialSubjectType;

export type CredentialStatusType = 'BitstringStatusListEntry' | 'StatusList2021Entry';
export type CredentialStatusPurpose = 'revocation' | 'suspension' | 'message';
