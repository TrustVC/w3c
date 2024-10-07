import { BaseKeyPair } from '../../lib/types';

export type DidWebGenerateKeyPairOptions = BaseKeyPair & {
  seed?: Uint8Array;
  seedBase58?: string;
  privateKeyBase58?: string;
  publicKeyBase58?: string;
};

export type DidWebGeneratedKeyPair = Pick<
  DidWebGenerateKeyPairOptions,
  'type' | 'seedBase58' | 'privateKeyBase58' | 'publicKeyBase58'
> & {
  seed?: Uint8Array;
  privateKey?: Uint8Array;
  publicKey?: Uint8Array;
};
