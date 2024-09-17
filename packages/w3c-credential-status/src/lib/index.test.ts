import { PrivateKeyPair, VerificationType } from '@tradetrust-tt/w3c-issuer';
import * as w3c_vc from '@tradetrust-tt/w3c-vc';
import { describe, expect, it, vi } from 'vitest';
import { CredentialStatusPurpose, CredentialStatusType } from './BitstringStatusList/types';
import * as helper from './helper';
import { createSignedCredentialStatusVC, verifyCredentialStatus } from './index';

const PRIVATE_KEY_PAIR: PrivateKeyPair = {
  id: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-1',
  controller: 'did:web:jocular-sunflower-144c0d.netlify.app',
  type: VerificationType.Bls12381G2Key2020,
  privateKeyBase58: '44ToWFUFdm9eUa5So3fc1tCTpziiZLYM4qy5vZaGds1c',
  publicKeyBase58:
    't5Rdg91V9rVVKSGbeJ6ZJP32cED2Dad1nEjQpgMwMrmbvwryzgy8ppg9dwMNWJEKQL2dotEKAe1Z9iAe5e6wQBngCEqESavreSX8d1TfPtCyRYntYQe9pQWvaGae6NvJ68J',
};

// First 10 (index 0 - 9) position is marked as True.
const credentialStatusVC = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  issuer: 'did:web:nghaninn.github.io:did:1',
  issuanceDate: '2024-09-17T06:44:34.527Z',
  validFrom: '2024-09-17T06:44:34.527Z',
  credentialSubject: {
    id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json#list',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'H4sIAAAAAAAAA-3BMQEAAAwCoPVPZbMZwwf4HAAAAAAAAAAAAAAAAAAAALBRLLoWyfc_AAA',
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-09-17T06:44:36Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'pTcAc0riPPIzejOcyM+7ogPFteq71UZsgZUpst5dJnMm7XduGfbeP2rBx+gjEpplD/iMJ2OcyX/970pihFWFl2iHZoOWvSdIKOyKIvA1pLUPIpr13aDnDBXGDhPCy7iUHxPT0mAgZtPPbh43L/z1GA==',
    verificationMethod: 'did:web:nghaninn.github.io:did:1#keys-1',
  },
};

const credentialStatusVC_withInvalidEncodedList = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json',
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  issuer: 'did:web:nghaninn.github.io:did:1',
  issuanceDate: '2024-09-17T07:40:28.638Z',
  validFrom: '2024-09-17T07:40:28.638Z',
  credentialSubject: {
    id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json#list',
    type: 'StatusList2021',
    statusPurpose: 'revocation',
    encodedList: 'encodedList',
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-09-17T07:40:30Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'lulsFsDcSEeDEp1g6ih+CCxoKOuQiGoaM319b8QyXyV9qwBLcpSo9xTYLM7F+au5ZmzMmmoBvYp8LURrUZTN4DtGR+ucQ7lsLUE/9nyF/gFWRh5wmBQkr9EnJ1STjyVIo4h90PjouXBUjJK/p8Pnhg==',
    verificationMethod: 'did:web:nghaninn.github.io:did:1#keys-1',
  },
};

const credentialStatus = {
  id: 'https://nghaninn.github.io/did/credentials/statuslist/1.json#1',
  type: 'StatusList2021Entry' as CredentialStatusType,
  statusPurpose: 'revocation' as CredentialStatusPurpose,
  statusListIndex: '1',
  statusListCredential: 'https://nghaninn.github.io/did/credentials/statuslist/1.json',
};

describe('w3c-credential-status', () => {
  describe('createCredentialStatusVC', () => {
    it('should create a credential status VC successfully', async () => {
      const { signed } = await createSignedCredentialStatusVC(
        {
          id: 'https://example.com/credentials/3732',
          credentialSubject: {
            type: 'StatusList2021',
            id: 'https://example.com/credentials/status/3#list',
            statusPurpose: 'revocation',
            encodedList: 'encodedList',
          },
        },
        PRIVATE_KEY_PAIR,
      );

      expect(signed).toMatchObject({
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/security/bbs/v1',
          'https://w3id.org/vc/status-list/2021/v1',
        ],
        credentialSubject: {
          encodedList: 'encodedList',
          id: 'https://example.com/credentials/status/3#list',
          statusPurpose: 'revocation',
          type: 'StatusList2021',
        },
        id: 'https://example.com/credentials/3732',
        issuanceDate: expect.any(String),
        issuer: 'did:web:jocular-sunflower-144c0d.netlify.app',
        proof: {
          created: expect.any(String),
          proofPurpose: 'assertionMethod',
          proofValue: expect.any(String),
          type: 'BbsBlsSignature2020',
          verificationMethod: 'did:web:jocular-sunflower-144c0d.netlify.app#keys-1',
        },
        type: ['VerifiableCredential', 'StatusList2021Credential'],
        validFrom: expect.any(String),
      });
    });

    it('should return an error if type is not supported', async () => {
      const { error } = await createSignedCredentialStatusVC(
        {
          id: 'https://example.com/credentials/3732',
        } as any,
        PRIVATE_KEY_PAIR,
        'unsupported' as any,
      );
      expect(error).toBe('Unsupported type: unsupported');
    });
  });

  describe('verifyCredentialStatus', () => {
    it('should verify a credential status successfully', async () => {
      vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: true });

      const { status } = await verifyCredentialStatus(credentialStatus);
      expect(status).toBe(true);

      const { status: status2 } = await verifyCredentialStatus({
        ...credentialStatus,
        statusListIndex: '10',
      });
      expect(status2).toBe(false);
    });

    it('should return an error if type is not supported', async () => {
      const { error } = await verifyCredentialStatus({
        type: 'unsupported',
      } as any);
      expect(error).toBe('Unsupported type: unsupported');
    });

    it('should return an error if the credential is not verified', async () => {
      vi.spyOn(helper, 'fetchCredentialStatusVC').mockResolvedValue(credentialStatusVC);
      vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: false });

      const { error } = await verifyCredentialStatus(credentialStatus);

      expect(error).toBe('Failed to verify Credential Status VC: false');
    });

    it('should return an error if BitstringStatusList is invalid', async () => {
      vi.spyOn(helper, 'fetchCredentialStatusVC').mockResolvedValue(
        credentialStatusVC_withInvalidEncodedList,
      );
      vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: true });

      const { error } = await verifyCredentialStatus(credentialStatus);

      expect(error).toBe('Invalid encodedList: encodedList cannot be decoded');
    });

    it('should return an error if statusPurpose does not match the statusPurpose in the VC', async () => {
      vi.spyOn(helper, 'fetchCredentialStatusVC').mockResolvedValue(credentialStatusVC);
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
      vi.spyOn(helper, 'fetchCredentialStatusVC').mockResolvedValue(credentialStatusVC);
      vi.spyOn(w3c_vc, 'verifyCredential').mockResolvedValue({ verified: true });

      const { error } = await verifyCredentialStatus({
        ...credentialStatus,
        statusListIndex: '200000',
      });

      expect(error).toBe('Invalid statusListIndex: Index out of range: min=0, max=130999');
    });
  });
});
