// @ts-ignore: No types available for jsonld
import * as jsonld from 'jsonld';
import { _checkCredentialStatus, _validateUriId } from '../../helper';
import { CredentialStatus, VerifiableCredential } from '../../types';

export const assertCredentialStatus = (
  cs: CredentialStatus,
  mode: 'sign' | 'verify' = 'verify',
): void => {
  const { id, type } = cs;
  if (id) {
    _validateUriId({ id: id, propertyName: 'credentialStatus.id' });
  }
  if (!type) {
    throw new Error('"credentialStatus" must include a type.');
  }

  _checkCredentialStatus(cs, mode);
};

export const assertCredentialStatuses = <T extends VerifiableCredential>(
  credential: T,
  mode: 'sign' | 'verify' = 'verify',
): void => {
  const cses = jsonld.getValues(credential, 'credentialStatus');
  cses.forEach((cs: T) => assertCredentialStatus(cs as CredentialStatus, mode));
  if (
    cses.some((cs: CredentialStatus) => cs?.type === 'TransferableRecords') &&
    credential?.credentialStatus?.type !== 'TransferableRecords'
  ) {
    throw new Error(
      '"credentialStatus" TransferableRecords must be the only credential status and must be an object.',
    );
  }
};
