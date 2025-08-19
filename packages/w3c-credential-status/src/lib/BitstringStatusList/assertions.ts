/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 * Implementing @digitalbazaar/bitstring
 */

import { VCBitstringCredentialSubject } from '../types';
import { StatusList } from './StatusList';
import { CredentialStatusPurpose } from './types';

export function isNumber(value: number, name: string): void {
  if (typeof value !== 'number') {
    throw new TypeError(`"${name}" must be number.`);
  }
}

export function isPositiveInteger(value: number, name: string): void {
  if (!(Number.isInteger(value) && Number(value) > 0)) {
    throw new TypeError(`"${name}" must be a positive integer.`);
  }
}

export function isString(value: string, name: string): void {
  if (typeof value !== 'string') {
    throw new TypeError(`"${name}" must be a string.`);
  }
}

export function isBoolean(value: boolean, name: string): void {
  if (typeof value !== 'boolean') {
    throw new TypeError(`"${name}" must be a Boolean.`);
  }
}

export function isNonNegativeInteger(value: number, name: string): void {
  if (!(Number.isInteger(value) && Number(value) >= 0)) {
    throw new TypeError(`"${name}" must be a non-negative integer.`);
  }
}

export function isUint8Array(value: Uint8Array, name: string): void {
  if (!(value instanceof Uint8Array)) {
    throw new TypeError(`"${name}" must be a Uint8Array.`);
  }
}

/**
 * Check if the statusPurpose is allowed.
 * @param statusPurpose - The statusPurpose to be checked.
 * @throws {Error} - Throws an error if the statusPurpose is not allowed.
 */
export function assertAllowedStatusPurpose(statusPurpose: CredentialStatusPurpose): void {
  const ALLOWED_STATUS_PURPOSES: CredentialStatusPurpose[] = ['revocation', 'suspension'];
  if (!ALLOWED_STATUS_PURPOSES.includes(statusPurpose)) {
    throw new Error(
      `Unsupported statusPurpose: statusPurpose must be "revocation" or "suspension".`,
    );
  }
}

/**
 * Check if the statusListIndex is within the range of the bitstringStatusList.
 * @param {StatusList} bitstringStatusList - The bitstringStatusList.
 * @param index - The index of the statusList.
 * @throws {Error} - Throws an error if the statusListIndex is out of range.
 */
export const assertStatusListIndexWithinRange = (
  bitstringStatusList: StatusList,
  index: number,
): void => {
  // Check if statusListIndex is within the range of the bitstringStatusList
  if (bitstringStatusList.length <= index || index < 0) {
    throw new Error(
      `Invalid statusListIndex: Index out of range: min=0, max=${bitstringStatusList.length - 1}`,
    );
  }
};

/**
 * Check if the credential subject is valid for the given credential type.
 * @param credentialSubject - The credential subject to be signed.
 * @param expectedType - The expected credential subject type.
 * @param credentialType - The credential type for error messages.
 * @throws {Error} - Throws an error if the credential subject is invalid.
 */
export function _checkCredentialSubjectForStatusListCredential(
  credentialSubject: VCBitstringCredentialSubject,
  expectedType: 'StatusList2021' | 'BitstringStatusList',
  credentialType: 'StatusList2021Credential' | 'BitstringStatusListCredential',
): void {
  // Check if credentialSubject is an object
  if (!credentialSubject) {
    throw new Error('Credential subject must be an object.');
  }

  // Check if credentialSubject has a type
  if (!credentialSubject?.type) {
    throw new Error('Credential subject must have a type.');
  }
  // Check if credentialSubject has the correct type
  if (credentialSubject.type !== expectedType) {
    throw new Error(
      `Invalid type for credentialSubject: Credential subject for ${credentialType} must have type "${expectedType}".`,
    );
  }

  // Check if credentialSubject has a statusPurpose
  if (!credentialSubject?.statusPurpose) {
    throw new Error('Credential subject must have a statusPurpose.');
  }
  assertAllowedStatusPurpose(credentialSubject.statusPurpose);

  // Check if credentialSubject has an encodedList
  if (!Object.keys(credentialSubject).includes('encodedList')) {
    throw new Error('Credential subject must have an encodedList.');
  }
  // Check if credentialSubject has a non-empty encodedList
  if (!credentialSubject?.encodedList?.length) {
    throw new Error('Credential subject must have a non-empty encodedList.');
  }
}

/**
 * Check if the credential subject is valid for a StatusList2021Credential.
 * @param credentialSubject - The credential subject to be signed.
 * @throws {Error} - Throws an error if the credential subject is invalid.
 */
export function _checkCredentialSubjectForStatusList2021Credential(
  credentialSubject: VCBitstringCredentialSubject,
): void {
  _checkCredentialSubjectForStatusListCredential(
    credentialSubject,
    'StatusList2021',
    'StatusList2021Credential',
  );
}

/**
 * Check if the credential subject is valid for a BitstringStatusListCredential.
 * @param credentialSubject - The credential subject to be signed.
 * @throws {Error} - Throws an error if the credential subject is invalid.
 */
export function _checkCredentialSubjectForBitstringStatusListCredential(
  credentialSubject: VCBitstringCredentialSubject,
): void {
  _checkCredentialSubjectForStatusListCredential(
    credentialSubject,
    'BitstringStatusList',
    'BitstringStatusListCredential',
  );
}
