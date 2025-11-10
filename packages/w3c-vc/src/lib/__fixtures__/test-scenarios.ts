import { CryptoSuiteName, SignedVerifiableCredential, VerifiableCredential } from '../types';
import { bbs2020KeyPair, bbs2023KeyPair, ecdsa2023KeyPair } from './key-pairs';
import { modernCredentialV1_1, modernCredentialV2_0 } from './modern-credentials';
import {
  bbs2020CredentialV1_1,
  bbs2020DerivedCredentialV1_1,
  bbs2020CredentialV2_0,
  bbs2020DerivedCredentialV2_0,
} from './bbs2020-credentials';
import {
  Bbs2023PrivateKeyPair,
  BBSPrivateKeyPair,
  EcdsaSd2023PrivateKeyPair,
} from '@trustvc/w3c-issuer';

export interface BBS2020TestScenario {
  cryptosuite: CryptoSuiteName;
  keyPair: BBSPrivateKeyPair;
  version: string;
  credential: SignedVerifiableCredential;
  derivedCredential: SignedVerifiableCredential;
}

export interface ModernCryptosuiteTestScenario {
  cryptosuite: CryptoSuiteName;
  keyPair: EcdsaSd2023PrivateKeyPair | Bbs2023PrivateKeyPair;
  version: string;
  credential: VerifiableCredential;
  dateField: string;
  dateValue: string;
}

// Parameterized test data for BBS2020 (legacy cryptosuite)
export const bbs2020TestScenarios: BBS2020TestScenario[] = [
  {
    cryptosuite: 'BbsBlsSignature2020' as CryptoSuiteName,
    keyPair: bbs2020KeyPair,
    version: 'v1.1',
    credential: bbs2020CredentialV1_1,
    derivedCredential: bbs2020DerivedCredentialV1_1,
  },
  {
    cryptosuite: 'BbsBlsSignature2020' as CryptoSuiteName,
    keyPair: bbs2020KeyPair,
    version: 'v2.0',
    credential: bbs2020CredentialV2_0,
    derivedCredential: bbs2020DerivedCredentialV2_0,
  },
];

// Parameterized test data for modern cryptosuites (ECDSA-SD-2023 and BBS-2023)
export const modernCryptosuiteTestScenarios: ModernCryptosuiteTestScenario[] = [
  {
    cryptosuite: 'ecdsa-sd-2023' as CryptoSuiteName,
    keyPair: ecdsa2023KeyPair,
    version: 'v1.1',
    credential: modernCredentialV1_1,
    dateField: 'issuanceDate',
    dateValue: '2024-04-01T12:19:52Z',
  },
  {
    cryptosuite: 'ecdsa-sd-2023' as CryptoSuiteName,
    keyPair: ecdsa2023KeyPair,
    version: 'v2.0',
    credential: modernCredentialV2_0,
    dateField: 'validFrom',
    dateValue: '2024-04-01T12:19:52Z',
  },
  {
    cryptosuite: 'bbs-2023' as CryptoSuiteName,
    keyPair: bbs2023KeyPair,
    version: 'v1.1',
    credential: modernCredentialV1_1,
    dateField: 'issuanceDate',
    dateValue: '2024-04-01T12:19:52Z',
  },
  {
    cryptosuite: 'bbs-2023' as CryptoSuiteName,
    keyPair: bbs2023KeyPair,
    version: 'v2.0',
    credential: modernCredentialV2_0,
    dateField: 'validFrom',
    dateValue: '2024-04-01T12:19:52Z',
  },
];
