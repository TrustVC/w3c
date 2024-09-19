import { isNonNegativeInteger, isNumber } from './BitstringStatusList/assertions';
import { CredentialStatusPurpose } from './BitstringStatusList/types';
import { VCBitstringCredentialSubject } from './types';

/**
 * Asserts the type of the credential status.
 * @param type - The type of the credential status.
 * @throws {Error} - Throws an error if the type is not supported.
 */
export const assertCredentialStatusType = <T>(type: T): void => {
  const supportedTypes: T[] = ['StatusList2021Entry' as T];

  if (!supportedTypes.includes(type)) {
    throw new Error(`Unsupported type: ${type}`);
  }
};

/**
 * Asserts the statusListIndex is a valid number.
 * @param statusListIndex - The index of the statusList in the statusListCredential.
 * @throws {Error} - Throws an error if the statusListIndex is not a valid number.
 */
export const assertStatusListIndex = (statusListIndex: string): void => {
  try {
    const index = Number.parseInt(statusListIndex);
    isNumber(index, 'statusListIndex');
    isNonNegativeInteger(index, 'statusListIndex');
  } catch (err) {
    throw new Error(`Invalid statusListIndex: Invalid Number: '${statusListIndex}'`);
  }
};

/**
 * Asserts the statusPurpose matches.
 * @param statusList - The statusList within the Credential Status VC.
 * @param statusPurpose - The credentialStatus.statusPurpose in the verifying VC.
 */
export const assertStatusPurposeMatches = (
  statusList: VCBitstringCredentialSubject,
  statusPurpose: CredentialStatusPurpose,
): void => {
  // Check if statusPurpose matches the statusPurpose in the VC
  if (statusList.statusPurpose !== statusPurpose) {
    throw new Error(`statusPurpose does not match the statusPurpose in the statusListCredential`);
  }
};
