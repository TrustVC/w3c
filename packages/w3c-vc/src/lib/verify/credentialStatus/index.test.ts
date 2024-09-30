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
  id: 'https://nghaninn.github.io/did/credentials/statuslist#1',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  issuer: 'did:web:nghaninn.github.io:did:1',
  issuanceDate: '2024-09-18T08:32:22.707Z',
  validFrom: '2024-09-18T08:32:22.707Z',
  credentialSubject: {
    id: 'https://nghaninn.github.io/did/credentials/statuslist/1#list',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'H4sIAAAAAAAAA-3BMQEAAAwCoPVPZbMZwwf4HAAAAAAAAAAAAAAAAAAAALBRLLoWyfc_AAA',
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-09-18T08:32:24Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'iTKbuWZ7Yly0kjK4tadb42h5pkPByuaUruVGtayegepHnUYmqFlzWZOMyb4GCEslB0vbbNOar5flz5quRUU3e7CMUcXR6Ty5oqleTuBecOggMW5THwgGxgJ6rSXK6+Z1Paqv+F37FyfDfIxiv63B2Q==',
    verificationMethod: 'did:web:nghaninn.github.io:did:1#keys-1',
  },
};

const credentialStatusVC_withInvalidEncodedList = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'https://nghaninn.github.io/did/credentials/statuslist#1',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  issuer: 'did:web:nghaninn.github.io:did:1',
  issuanceDate: '2024-09-18T08:41:08.157Z',
  validFrom: '2024-09-18T08:41:08.157Z',
  credentialSubject: {
    id: 'https://nghaninn.github.io/did/credentials/statuslist/1#list',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'encodedList',
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-09-18T08:41:09Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'l/46gB3E+8EfhFqFkBRvvgdGvayxSrNuGsPswIUqeS8je7YRW1UIOeLYtOa7VoDcO2snTSMSDGIhZn2OZUcuFomAVutDJvpy+4AmUl4y4m0yEalOmXix+4Mf8QQm7bQiR/itcmA4puQyy4z24qk1Kg==',
    verificationMethod: 'did:web:nghaninn.github.io:did:1#keys-1',
  },
};

const credentialStatus = {
  id: 'https://nghaninn.github.io/did/credentials/statuslist/1#1',
  type: 'StatusList2021Entry' as CredentialStatusType,
  statusPurpose: 'revocation' as CredentialStatusPurpose,
  statusListIndex: '1',
  statusListCredential: 'https://nghaninn.github.io/did/credentials/statuslist/1',
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

    expect(error).toBe('Invalid statusListIndex: Index out of range: min=0, max=130999');
  });
});
