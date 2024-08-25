import { BaseKeyPair } from '../../lib/types';

export type DidEtherGenerateKeyPairOptions = BaseKeyPair & {
  mnemonics?: string;
  password?: string;
  path?: string;

  privateKeyHex?: string;
  blockchainAccountId?: string;
};

export type DidEtherGeneratedKeyPair = Required<DidEtherGenerateKeyPairOptions>;
