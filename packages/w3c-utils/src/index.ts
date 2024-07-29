import { base58btc } from 'multiformats/bases/base58';
import { base64, base64pad, base64url, base64urlpad } from 'multiformats/bases/base64';
import {
  base32,
  base32hex,
  base32hexpad,
  base32hexpadupper,
  base32hexupper,
  base32pad,
  base32padupper,
  base32upper,
  base32z,
} from 'multiformats/bases/base32';
import { base16, base16upper } from 'multiformats/bases/base16';

export const parseMultibase = async (multibase: string): Promise<Uint8Array> => {
  const [prefix, ..._value] = multibase;

  const supportedBases = [
    base58btc,
    base64,
    base64pad,
    base64url,
    base64urlpad,
    base32,
    base32hex,
    base32hexpad,
    base32hexpadupper,
    base32hexupper,
    base32pad,
    base32padupper,
    base32upper,
    base32z,
    base16,
    base16upper,
  ];

  const base = supportedBases.find((base) => base.prefix === prefix);

  if (!base) {
    throw new Error('Unsupported multibase');
  }

  return base.decode(multibase);
};

export const getDomainHostname = (domain: Readonly<string>): string | undefined => {
  // convert domain https://example.com/part/index?id=123 to example.com

  if (!domain) {
    return undefined;
  }

  const url = new URL(domain);
  return url.hostname;
};
