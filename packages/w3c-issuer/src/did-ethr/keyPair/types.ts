import { BaseKeyPair } from '../../lib/types';

export type DidEtherGenerateKeyPairOptions = BaseKeyPair & {
  mnemonics?: string;
  password?: string;
  path?: string;

  privateKeyHex?: string;
  privateKeyMultibase?: string;
  publicKeyHex?: string;
  publicKeyMultibase?: string;
  ethereumAddress?: string;
};

export type DidEtherGeneratedKeyPair = Required<DidEtherGenerateKeyPairOptions>;
