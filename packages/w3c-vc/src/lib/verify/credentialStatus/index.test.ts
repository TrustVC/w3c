import * as w3c_credential_status from '@trustvc/w3c-credential-status';
import { CredentialStatusPurpose, CredentialStatusType } from '@trustvc/w3c-credential-status';
import { describe, expect, it, vi } from 'vitest';
import { SignedVerifiableCredential } from '../../types';
import * as w3c_vc from './../../w3c-vc';
import { verifyCredentialStatus } from './index';

// First 10 (index 0 - 9) position is marked as True.
const credentialStatusVC: SignedVerifiableCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'https://trustvc.github.io/did/credentials/statuslist/1',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  issuer: 'did:web:trustvc.github.io:did:1',
  issuanceDate: '2024-10-02T08:49:52.749Z',
  validFrom: '2024-10-02T08:49:52.435Z',
  credentialSubject: {
    id: 'https://trustvc.github.io/did/credentials/statuslist/1#list',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'H4sIAAAAAAAAA-3BMQEAAAwCoH32b7RoxvAB8gcAAAAAAAAAAAAAAAAAAACMFVeOQ9sAQAAA',
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-10-02T08:49:54Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'ohxpxgF6BUhGkSLBSGknWAVgx2flaQ4Hvl8MpD+tvVVEESXlQf0PbefZgg0Kj4+AUQS9wzJ/DjfbmkEkqiQU4RSKC82uPmoL5K7QWQRL4G8tymiY5ITLuRtYeACoiZz/dhF1wxxyJArGEI8ZWGCGNw==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
  },
};

const credentialStatusVC_withInvalidEncodedList = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'https://trustvc.github.io/did/credentials/statuslist/1',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  issuer: 'did:web:trustvc.github.io:did:1',
  issuanceDate: '2024-10-02T09:09:50.410Z',
  validFrom: '2024-10-02T08:49:52.435Z',
  credentialSubject: {
    id: 'https://trustvc.github.io/did/credentials/statuslist/1#list',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'encodedList',
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-10-02T09:09:51Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'qIxEb/9zDvjESQGkrBs6D+ilnloRfgFUkEZaBu6qNJfd48QD5XGg834pUu7l6HwKXsW19OKA1DRgKp9j+9zTm52YMl4GiMqZW/rXh8Cf6zsefU4guMtYMQa8MDaxy51rc8mnE09LqP8qcJGH6iwm7Q==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
  },
};

const credentialStatus = {
  id: 'https://trustvc.github.io/did/credentials/statuslist/1#1',
  type: 'StatusList2021Entry' as CredentialStatusType,
  statusPurpose: 'revocation' as CredentialStatusPurpose,
  statusListIndex: '5',
  statusListCredential: 'https://trustvc.github.io/did/credentials/statuslist/1',
};

describe('verifyCredentialStatus', () => {
  it('should verify a credential status successfully', async () => {
    vi.spyOn(w3c_credential_status, 'fetchCredentialStatusVC').mockResolvedValue(
      credentialStatusVC,
    );
    vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: true });

    const { status } = await verifyCredentialStatus(credentialStatus);
    expect(status).toBe(true);

    const { status: status2, purpose } = await verifyCredentialStatus({
      ...credentialStatus,
      statusListIndex: '10',
    });
    expect(status2).toBe(false);
    expect(purpose).toBe('revocation');
  });

  it('should return an error if type is not supported', async () => {
    const { error } = await verifyCredentialStatus({
      type: 'unsupported',
    } as any);
    expect(error).toBe('Unsupported type: unsupported');
  });

  it('should return an error if the credential is not verified', async () => {
    vi.spyOn(w3c_credential_status, 'fetchCredentialStatusVC').mockResolvedValue(
      credentialStatusVC,
    );
    vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: false });

    const { error } = await verifyCredentialStatus(credentialStatus);

    expect(error).toBe('Failed to verify Credential Status VC: false');
  });

  it('should return an error if BitstringStatusList is invalid', async () => {
    vi.spyOn(w3c_credential_status, 'fetchCredentialStatusVC').mockResolvedValue(
      credentialStatusVC_withInvalidEncodedList,
    );
    vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: true });

    const { error } = await verifyCredentialStatus(credentialStatus);

    expect(error).toBe('Invalid encodedList: encodedList cannot be decoded');
  });

  it('should return an error if statusPurpose does not match the statusPurpose in the VC', async () => {
    vi.spyOn(w3c_credential_status, 'fetchCredentialStatusVC').mockResolvedValue(
      credentialStatusVC,
    );
    vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: true });

    const { error } = await verifyCredentialStatus({
      ...credentialStatus,
      statusPurpose: 'suspension',
    });

    expect(error).toBe(
      'statusPurpose does not match the statusPurpose in the statusListCredential',
    );
  });

  it('should return an error if statusPurpose is not supported', async () => {
    const { error } = await verifyCredentialStatus({
      ...credentialStatus,
      statusPurpose: 'unsupported' as any,
    });

    expect(error).toBe(
      `Unsupported statusPurpose: statusPurpose must be "revocation" or "suspension".`,
    );

    const cloneCredentialStatus = { ...credentialStatus } as any;
    delete cloneCredentialStatus.statusPurpose;
    const { error: error2 } = await verifyCredentialStatus(cloneCredentialStatus);

    expect(error2).toBe(
      `Unsupported statusPurpose: statusPurpose must be "revocation" or "suspension".`,
    );
  });

  it('should return an error if statusListIndex is not a number', async () => {
    const { error } = await verifyCredentialStatus({
      ...credentialStatus,
      statusListIndex: 'invalid',
    });

    expect(error).toBe(`Invalid statusListIndex: Invalid Number: 'invalid'`);
  });

  it('should return an error if statusListIndex is out of range', async () => {
    vi.spyOn(w3c_credential_status, 'fetchCredentialStatusVC').mockResolvedValue(
      credentialStatusVC,
    );
    vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: true });

    const { error } = await verifyCredentialStatus({
      ...credentialStatus,
      statusListIndex: '200000',
    });

    expect(error).toBe('Invalid statusListIndex: Index out of range: min=0, max=131071');
  });
});
