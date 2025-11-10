import { DIDDocument } from 'did-resolver';
import { GenerateKeyPairOptions, VerificationType } from '../../lib/types';

export type IssuedDIDOption = GenerateKeyPairOptions & {
  domain?: string;
};

export enum WellKnownEnum {
  ALSO_KNOWN_AS = 'alsoKnownAs',
  ASSERTION_METHOD = 'assertionMethod',
  AUTHENTICATION = 'authentication',
  CAPABILITY_DELEGATION = 'capabilityDelegation',
  CAPABILITY_INVOCATION = 'capabilityInvocation',
  CONTROLLER = 'controller',
  KEY_AGRREEMENT = 'keyAgreement',
  SERVICE = 'service',
  VERIFICATION_METHOD = 'verificationMethod',
}

export type WellKnownAttributeType = Extract<
  WellKnownEnum,
  | WellKnownEnum.AUTHENTICATION
  | WellKnownEnum.ASSERTION_METHOD
  | WellKnownEnum.CAPABILITY_INVOCATION
  | WellKnownEnum.CAPABILITY_DELEGATION
>;

export const WellKnownAttribute: readonly WellKnownAttributeType[] = [
  WellKnownEnum.AUTHENTICATION,
  WellKnownEnum.ASSERTION_METHOD,
  WellKnownEnum.CAPABILITY_INVOCATION,
  WellKnownEnum.CAPABILITY_DELEGATION,
] as const;

export type KeyPair = BBSKeyPair | ECDSAKeyPair | MultikeyKeyPair;
export type BBSKeyPair = {
  id: string;
  type: VerificationType;
  controller: string;
  publicKeyBase58?: string;
};
export type ECDSAKeyPair = {
  id: string;
  type: VerificationType;
  controller: string;
  publicKeyHex?: string;
  publicKeyMultibase?: string;
  blockchainAccountId?: string;
};
export type MultikeyKeyPair = {
  '@context'?: string;
  id: string;
  type: VerificationType.Multikey;
  controller: string;
  publicKeyMultibase?: string;
};
export type Bbs2023KeyPair = MultikeyKeyPair;
export type EcdsaSd2023KeyPair = MultikeyKeyPair;

export type PrivateKeyPair =
  | BBSPrivateKeyPair
  | ECDSAPrivateKeyPair
  | Bbs2023PrivateKeyPair
  | EcdsaSd2023PrivateKeyPair;
export type BBSPrivateKeyPair = BBSKeyPair & {
  seedBase58?: string;
  privateKeyBase58?: string;
};
export type ECDSAPrivateKeyPair = ECDSAKeyPair & {
  path?: string;
  privateKeyHex?: string;
  privateKeyMultibase?: string;
  mnemonics?: string;
};
export type Bbs2023PrivateKeyPair = Bbs2023KeyPair & {
  seedBase58?: string;
  secretKeyMultibase?: string;
};
export type EcdsaSd2023PrivateKeyPair = EcdsaSd2023KeyPair & {
  secretKeyMultibase?: string;
};

export type DidWellKnownDocument = DIDDocument & {
  [key in WellKnownAttributeType]?: string[];
};

export type QueryDidDocumentOption = {
  domain?: Readonly<string>;
  did?: Readonly<string>;
};

export type QueryDidDocument = {
  did: string;
  wellKnownDid: DidWellKnownDocument | undefined;
};

export type IssuedDID = {
  wellKnownDid: DidWellKnownDocument;
  didKeyPairs: PrivateKeyPair;
};
