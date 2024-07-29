import { DIDDocument } from 'did-resolver';
import { GenerateKeyPairOptions } from '../keyPair/types';

export type KeyPairType = GenerateKeyPairOptions & {
  domain: string;
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

export type DidKeyPair = {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58: string;
};

export type DidPrivateKeyPair = DidKeyPair & {
  seedBase58: string;
  privateKeyBase58: string;
};

export type DidWellKnownDocument = DIDDocument & {
  [key in WellKnownAttributeType]?: string[];
};
