import { generateMnemonic } from 'bip39';
import { defaultPath, HDNodeWallet } from 'ethers';
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
    password,
    path,
    privateKeyHex: hdNode.privateKey,
    blockchainAccountId: hdNode.address,
  };
};
