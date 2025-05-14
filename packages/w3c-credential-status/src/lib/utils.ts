import { DocumentLoader, getDocumentLoader } from '@trustvc/w3c-context';
import {
  assertAllowedStatusPurpose,
  isNonNegativeInteger,
  isNumber,
  isString,
} from './BitstringStatusList/assertions';
import { CredentialStatusPurpose } from './BitstringStatusList/types';
import {
  BitstringStatusListCredentialStatus,
  GeneralCredentialStatus,
  SignedCredentialStatusVC,
  TransferableRecordsCredentialStatus,
  VCBitstringCredentialSubject,
} from './types';

/**
 * Asserts the type of the credential status.
 * @param type - The type of the credential status.
 * @throws {Error} - Throws an error if the type is not supported.
 */
export const assertCredentialStatusType = <T>(type: T): void => {
  const supportedTypes: T[] = ['StatusList2021Entry', 'TransferableRecords'] as T[];

  if (!supportedTypes.includes(type)) {
    throw new Error(`Unsupported type: ${type}`);
  }
};

/**
 * Asserts the type of the credential status statusList.
 * @param type - The type of the credential status.
 * @throws {Error} - Throws an error if the type is not supported.
 */
export const assertCredentialStatusStatusListType = <T>(type: T): void => {
  const supportedTypes: T[] = ['StatusList2021Entry'] as T[];

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

export const assertCredentialStatus = (credentialStatus: GeneralCredentialStatus): void => {
  switch (credentialStatus.type) {
    case 'StatusList2021Entry':
      assertStatusList2021Entry(credentialStatus as BitstringStatusListCredentialStatus);
      break;
    default:
      throw new Error(`Unsupported type: ${credentialStatus.type}`);
  }
};

/**
 * Validates that a given ID is a URL.
 * Throws an error if the ID is not a valid URL.
 *
 * @param {object} options - The options for validation.
 * @param {string} options.id - The ID to validate.
 * @param {string} options.propertyName - The name of the property being validated.
 * @throws {Error} If the ID is not a valid URL.
 */
export function _validateUriId({ id, propertyName }: { id: string; propertyName: string }): void {
  let parsed: URL;
  try {
    parsed = new URL(id);
  } catch (e) {
    const error = new Error(`"${propertyName}" must be a URI: "${id}".`);
    throw error;
  }

  if (!parsed.protocol) {
    throw new Error(`"${propertyName}" must be a URI: "${id}".`);
  }
}

export const assertStatusList2021Entry = (
  credentialStatus: BitstringStatusListCredentialStatus,
): void => {
  const { type, statusPurpose, statusListIndex, statusListCredential } = credentialStatus;
  assertCredentialStatusType(type);
  assertAllowedStatusPurpose(statusPurpose);
  assertStatusListIndex(statusListIndex);
  _validateUriId({
    id: statusListCredential,
    propertyName: 'credentialStatus.statusListCredential',
  });
};

export const assertTransferableRecords = (
  credentialStatus: TransferableRecordsCredentialStatus,
  mode: 'sign' | 'verify' = 'verify',
): void => {
  const {
    type,
    tokenId,
    tokenNetwork: { chain, chainId },
    tokenRegistry,
  } = credentialStatus;
  assertCredentialStatusType(type);

  if (tokenId && mode === 'sign') {
    throw new Error(
      `"tokenId" is a generated field and should not be included in the credential status.`,
    );
  } else if (mode === 'verify') {
    isString(tokenId, 'credentialStatus.tokenId');
  }

  isString(tokenRegistry, 'credentialStatus.tokenRegistry');
  isString(chain, 'credentialStatus.tokenNetwork.chain');
  isNumber(Number(chainId), 'credentialStatus.tokenNetwork.chainId');
};

/**
 * Fetches the verifiable credential of the credential status.
 * @param {string} url - The URL of the statusListCredential.
 * @returns {Promise<T>} The verifiable credential of the credential status.
 */
export const fetchCredentialStatusVC = async <T>(
  url: string,
  documentLoader?: DocumentLoader,
): Promise<T> => {
  // Check statusListCredential is valid e.g. URL
  if (!url || !URL.canParse(url)) {
    throw new Error(`Invalid statusListCredential: "${url}"`);
  }

  try {
    documentLoader = documentLoader ?? (await getDocumentLoader());
    const result = (await documentLoader(url))?.document as T;
    return result;
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      throw new Error(`Failed to fetch Credential Status VC`);
    }
    throw new Error(`Credential Status VC not found: ${err?.message}`);
  }
};

export const getValidFromDateFromCredentialStatusVC = async (url: string): Promise<string> => {
  const defaultValidFrom = new Date().toISOString();
  try {
    const signedCredentialStatusVC: SignedCredentialStatusVC = await fetchCredentialStatusVC(url);
    return signedCredentialStatusVC?.validFrom ?? defaultValidFrom;
  } catch (err) {
    return defaultValidFrom;
  }
};
