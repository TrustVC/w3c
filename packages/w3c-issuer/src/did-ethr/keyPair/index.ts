import { generateMnemonic } from 'bip39';
import { defaultPath, HDNodeWallet } from 'ethers';
import { base58btc } from 'multiformats/bases/base58';
import { parseMultibase } from '../../lib';
import { VerificationType } from '../../lib/types';
import { DidEtherGeneratedKeyPair, DidEtherGenerateKeyPairOptions } from './types';

export const generateEthrKeyPair = async (
  options?: DidEtherGenerateKeyPairOptions,
): Promise<DidEtherGeneratedKeyPair> => {
  let { mnemonics, path } = options ?? {};
  const { password } = options ?? {};

  if (!mnemonics) {
    mnemonics = generateMnemonic();
  }

  if (!path) {
    path = defaultPath;
  }

  const hdNode = HDNodeWallet.fromPhrase(mnemonics, password, path);

  return {
    type: VerificationType.EcdsaSecp256k1RecoveryMethod2020,
    mnemonics,
    password: password ?? '',
    path,
    privateKeyHex: hdNode.privateKey,
    privateKeyMultibase: base58btc.encode(await parseMultibase('f' + hdNode.privateKey.slice(2))),
    publicKeyHex: hdNode.publicKey,
    publicKeyMultibase: base58btc.encode(await parseMultibase('f' + hdNode.publicKey.slice(2))),
    ethereumAddress: hdNode.address,
  };
};
