import { RawVerifiableCredential, SignedVerifiableCredential } from '@trustvc/w3c-vc';

export const mockCredential = Object.freeze({
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3c-ccg.github.io/citizenship-vocab/contexts/citizenship-v1.jsonld',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
  ],
  credentialStatus: {
    id: 'https://trustvc.github.io/did/credentials/statuslist/1#1',
    type: 'StatusList2021Entry',
    statusPurpose: 'revocation',
    statusListIndex: '10',
    statusListCredential: 'https://trustvc.github.io/did/credentials/statuslist/1',
  },
  credentialSubject: {
    name: 'TrustVC',
    birthDate: '2024-04-01T12:19:52Z',
    type: ['PermanentResident', 'Person'],
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
  issuanceDate: '2024-04-01T12:19:52Z',
} as RawVerifiableCredential);

export const mockSignedCredential = Object.freeze({
  ...mockCredential,
  id: 'urn:uuid:0192b20e-0ba5-76d8-b682-7538c86a4d69',
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2024-11-11T00:43:34Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'hPm0Ef9HdptikoYojeF+X3xPyznAfPUROX5cBTzeINsvZJB0utLFfSMPrkgJCh9mYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
  },
} as SignedVerifiableCredential);
