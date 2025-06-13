import { CredentialContextVersion } from '@trustvc/w3c-context';
import {
  assertCredentialStatusType,
  assertStatusList2021Entry,
  assertTransferableRecords,
  BitstringStatusListCredentialStatus,
  TransferableRecordsCredentialStatus,
} from '@trustvc/w3c-credential-status';
import { BBSPrivateKeyPair, PrivateKeyPair, VerificationType } from '@trustvc/w3c-issuer';
import { createHash } from 'crypto';
// @ts-ignore: No types available for jsonld
import * as jsonld from 'jsonld';
import { v7 as uuidv7 } from 'uuid';
import { assertCredentialStatuses } from '../sign/credentialStatus';
import {
  CredentialStatus,
  CredentialSubject,
  ProofType,
  proofTypeMapping,
  RawVerifiableCredential,
  VerifiableCredential,
} from '../types';

/**
 * Validates a key pair object to ensure it contains the required properties.
 * Throws an error if any of the required properties (controller, id, privateKeyBase58, publicKeyBase58) are missing.
 *
 * @param {PrivateKeyPair} keyPair - The key pair object to be validated.
 * @throws {Error} If any required property is missing in the key pair.
 */
export function _checkKeyPair(keyPair: PrivateKeyPair) {
  if (!keyPair.controller) {
    throw new Error('"controller" property in keyPair is required.');
  }
  if (!keyPair.id) {
    throw new Error('"id" property in keyPair is required.');
  }
  if (keyPair.type === VerificationType.Bls12381G2Key2020) {
    if (!(keyPair as BBSPrivateKeyPair).privateKeyBase58) {
      throw new Error('"privateKeyBase58" property in keyPair is required.');
    }
    if (!(keyPair as BBSPrivateKeyPair).publicKeyBase58) {
      throw new Error('"publicKeyBase58" property in keyPair is required.');
    }
  }
}

/**
 * Retrieves the `id` property from an object or returns the object itself if it's a string.
 * Returns undefined if the object does not contain an `id` property.
 *
 * @param {object|string} obj - The object from which to retrieve the `id`, or a string.
 * @returns {string|undefined} The `id` property or the input string, or undefined if `id` is missing.
 */
function _getId<T extends { id?: string }>(obj: T | string): string | undefined {
  if (typeof obj === 'string') {
    return obj;
  }

  if (!('id' in obj)) {
    return;
  }

  return obj.id;
}

// These properties of a Verifiable Credential (VC) must be objects containing a type field
// if they are present in the VC.
const mustHaveType = ['proof', 'credentialStatus'];

// Regular expression to validate date-time format according to XML schema.
// Z and T must be uppercase
// @see https://www.w3.org/TR/xmlschema11-2/#dateTime
const dateRegex = new RegExp(
  '-?([1-9][0-9]{3,}|0[0-9]{3})' +
    '-(0[1-9]|1[0-2])' +
    '-(0[1-9]|[12][0-9]|3[01])' +
    'T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](.[0-9]+)?|(24:00:00(.0+)?))' +
    '(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?',
);

/**
 * Validates that a date string in a Verifiable Credential follows the correct format.
 * Throws an error if the date string does not match the expected format.
 *
 * @param {object} options - An object containing the credential and the property to check.
 * @param {object} options.credential - The Verifiable Credential object.
 * @param {string} options.prop - The property name that contains the date string.
 * @throws {Error} If the date string is invalid.
 */
function assertDateString({
  credential,
  prop,
}: {
  credential: VerifiableCredential;
  prop: string;
}): void {
  const value = credential[prop];
  if (!dateRegex.test(value)) {
    throw new Error(`"${prop}" must be a valid date: ${value}`);
  }
}

/**
 * Checks if the first element of the '@context' field in the credential is the expected value.
 * Returns true if the context is valid, otherwise false.
 *
 * @param {object} credential - The Verifiable Credential object.
 * @throws {Error} If the context is invalid.
 */
function assertCredentialContext(credential: VerifiableCredential): void {
  if (credential['@context'][0] !== CredentialContextVersion.v1) {
    throw new Error(`The first element of '@context' must be '${CredentialContextVersion.v1}'`);
  }
}

/**
 * Validates a Verifiable Credential (VC) based on a set of rules.
 * Throws an error if any validation check fails.
 *
 * @param {T} credential - The Verifiable Credential object.
 * @param {string|Date} [now=new Date()] - The current date/time, used for validation.
 * @param {'sign' | 'verify'} [mode='verify'] - The mode of operation, either `sign` or `verify`.
 * @throws {Error} If any validation rule is violated.
 */
export function _checkCredential<T extends VerifiableCredential>(
  credential: T,
  now = new Date(),
  mode: 'sign' | 'verify' = 'verify',
): void {
  if (typeof now === 'string') {
    now = new Date(now);
  }

  // Check the first element of the '@context' field in the credential
  if (jsonld.getValues(credential, '@context').length < 1) {
    throw new Error('"@context" property is required.');
  }
  assertCredentialContext(credential);

  // Check if the "type" field exists and contains the required VerifiableCredential type
  if (!credential.type) {
    throw new Error('"type" property is required.');
  }
  if (!jsonld.getValues(credential, 'type').includes('VerifiableCredential')) {
    throw new Error('"type" must include `VerifiableCredential`.');
  }

  // Check the credentialSubject field
  _checkCredentialSubjects(credential);

  // Check if the issuer field exists and validate for uniqueness and URL format
  if (!credential.issuer) {
    throw new Error('"issuer" property is required.');
  }
  if (jsonld.getValues(credential, 'issuer').length > 1) {
    throw new Error('"issuer" property can only have one value.');
  }
  if ('issuer' in credential) {
    const issuer = _getId(credential.issuer);
    if (!issuer) {
      throw new Error(`"issuer" id is required.`);
    }
    _validateUriId({ id: issuer, propertyName: 'issuer' });
  }

  // Validate issuanceDate field
  if (!credential.issuanceDate) {
    throw new Error('"issuanceDate" property is required.');
  }
  assertDateString({ credential, prop: 'issuanceDate' });

  // Ensure issuanceDate has only one value
  if (jsonld.getValues(credential, 'issuanceDate').length > 1) {
    throw new Error('"issuanceDate" property can only have one value.');
  }

  // Optionally validate expirationDate field if it exists
  if ('expirationDate' in credential) {
    assertDateString({ credential, prop: 'expirationDate' });
    if (mode === 'verify') {
      if (now > new Date(credential.expirationDate)) {
        console.warn('Credential has expired.');
        // throw new Error('Credential has expired.');
      }
    }
  }

  // Check if the current date is before the issuance date during verification
  if (mode === 'verify') {
    const issuanceDate = new Date(credential.issuanceDate);
    if (now < issuanceDate) {
      throw new Error(
        `The current date time (${now.toISOString()}) is before the ` +
          `"issuanceDate" (${credential.issuanceDate}).`,
      );
    }

    // Validate proof field for presence and type during verification
    if (!credential.proof) {
      throw new Error('"proof" property is required.');
    }
    if (jsonld.getValues(credential, 'proof').length > 1) {
      throw new Error('"proof" property can only have one value.');
    }
    // check proof type
    const proofType = jsonld.getValues(credential, 'proof')[0].type as ProofType;
    if (!proofTypeMapping[proofType]) {
      throw new Error('"proof" type is not of BbsBlsSignature2020.');
    }
  }

  // Ensure the proof and id field is absent when signing
  if (mode === 'sign') {
    if (credential.proof) {
      throw new Error('"proof" property is already there.');
    }

    // The "id" is generated programmatically later on
    if (credential.id) {
      throw new Error('"id" is a defined field and should not be set by the user.');
    }
  }

  // Validate credentialStatus field if present
  assertCredentialStatuses(credential, mode);

  // Validate that certain fields, if present, are objects with a type property
  for (const prop of mustHaveType) {
    if (prop in credential) {
      const _value = credential[prop];
      if (Array.isArray(_value)) {
        _value.forEach((entry) => _checkTypedObject(entry, prop));
        continue;
      }
      _checkTypedObject(_value, prop);
    }
  }
}

/**
 * Validates that an object contains a type field and is not empty.
 * Throws an error if the object is invalid.
 *
 * @param {object} obj - The object to validate.
 * @param {string} name - The name of the property being validated.
 * @throws {Error} If the object is invalid.
 */
function _checkTypedObject<T extends object>(obj: T, name: string): void {
  if (!isObject(obj)) {
    throw new Error(`property "${name}" must be an object.`);
  }
  if (_emptyObject(obj)) {
    throw new Error(`property "${name}" can not be an empty object.`);
  }
  if (!('type' in obj)) {
    throw new Error(`property "${name}" must have property type.`);
  }
}

/**
 * Validates the credentialSubject field in a Verifiable Credential.
 * Throws an error if the field is missing or invalid.
 *
 * @param {VerifiableCredential} credential - The Verifiable Credential object.
 * @throws {Error} If the credentialSubject field is missing or invalid.
 */
function _checkCredentialSubjects(credential: VerifiableCredential): void {
  if (!credential?.credentialSubject) {
    throw new Error('"credentialSubject" property is required.');
  }

  if (Array.isArray(credential?.credentialSubject)) {
    credential?.credentialSubject.map((subject: CredentialSubject) =>
      _checkCredentialSubject({ subject }),
    );
    return;
  }

  _checkCredentialSubject({ subject: credential?.credentialSubject });
}

/**
 * Validates a credential subject object to ensure it contains valid properties.
 * Throws an error if the credential subject is not valid.
 *
 * @param {CredentialSubject} subject - The credential subject object to validate.
 * @throws {Error} If the credential subject is invalid.
 */
function _checkCredentialSubject(subject: CredentialSubject): void {
  if (isObject(subject) === false) {
    throw new Error('"credentialSubject" must be a non-null object.');
  }
  if (_emptyObject(subject)) {
    throw new Error('"credentialSubject" must make a claim.');
  }
  // If credentialSubject.id is present and is not a URI, reject it
  if (subject.id) {
    _validateUriId({
      id: subject.id,
      propertyName: 'credentialSubject.id',
    });
  }
}

/**
 * Checks if the provided value is a valid object.
 *
 * @param {any} obj - The value to check.
 * @returns {boolean} True if the value is a valid object, otherwise false.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObject(obj: any): boolean {
  // return false for null even though it has type object
  if (obj === null) {
    return false;
  }
  // if something has type object and is not null return true
  if (typeof obj === 'object') {
    return true;
  }
  // return false for strings, symbols, etc.
  return false;
}

/**
 * Checks if the provided object is empty (i.e., has no properties).
 *
 * @param {object} obj - The object to check.
 * @returns {boolean} True if the object is empty, otherwise false.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _emptyObject(obj: any): boolean {
  // if the parameter is not an object return true
  // as a non-object is an empty object
  if (!isObject(obj)) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

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

/**
 * Asserts the credential status is valid.
 * @param credentialStatus - The credential status to be verified.
 * @throws {Error} - Throws an error if the credential status is invalid.
 */
export const _checkCredentialStatus = (
  credentialStatus: CredentialStatus,
  mode: 'sign' | 'verify' = 'verify',
): void => {
  const { type } = credentialStatus ?? {};

  if (type === 'StatusList2021Entry') {
    assertStatusList2021Entry(credentialStatus as BitstringStatusListCredentialStatus);
  } else if (type === 'TransferableRecords') {
    assertTransferableRecords(credentialStatus as TransferableRecordsCredentialStatus, mode);
  } else {
    assertCredentialStatusType(type);
  }
};

/**
 * Prefills the credential ID with a UUIDv7.
 * If the credentialStatus is present with type TransferableRecords, set the tokenId.
 *
 * @param {RawVerifiableCredential} credential
 * @returns {RawVerifiableCredential}
 */
export const prefilCredentialId = (
  credential: RawVerifiableCredential,
): RawVerifiableCredential => {
  credential.id = `urn:bnid:_:${uuidv7()}`;

  if (credential?.credentialStatus?.type === 'TransferableRecords') {
    credential.credentialStatus = {
      ...credential.credentialStatus,
      tokenId: createHash('sha256').update(credential.id).digest('hex'),
    };
  }
  return credential;
};
