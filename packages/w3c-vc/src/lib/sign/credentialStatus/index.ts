import { _checkCredentialStatus, _validateUriId } from '../../helper';
import { CredentialStatus } from '../../types';

export const assertCredentialStatus = (cs: CredentialStatus): void => {
  const { id, type } = cs;
  if (id) {
    _validateUriId({ id: id, propertyName: 'credentialStatus.id' });
  }
  if (!type) {
    throw new Error('"credentialStatus" must include a type.');
  }

  _checkCredentialStatus(cs);
};
