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

export type KeyPair = {
  id: string;
  type: VerificationType;
  controller: string;
  publicKeyBase58?: string;
  blockchainAccountId?: string;
};

export type PrivateKeyPair = KeyPair & {
  seedBase58?: string;
  privateKeyBase58?: string;

  path?: string;
  privateKeyHex?: string;
  privateKeyMultibase?: string;
  publicKeyHex?: string;
  publicKeyMultibase?: string;
  mnemonics?: string;
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
