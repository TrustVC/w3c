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

/**
 * Strip the query, hash and protocol from the domain.
 *
 * @param {string} domain - Domain name (e.g., https://example.com/part/index?id=123)
 * @returns {string} - Domain name (e.g., example.com/part/index)
 */
export const getDomain = (domain: Readonly<string>): string | undefined => {
  if (!domain || domain.trim() === '') {
    return undefined;
  }

  try {
    // Ensure we have a protocol for the URL constructor
    const parsedUrl = domain.startsWith('http') ? domain : 'http://' + domain;
    const url = new URL(parsedUrl);

    // Basic validation: ensure the hostname has at least one dot (for TLD)
    if (!url.hostname.includes('.')) {
      return undefined;
    }

    // Return hostname with pathname if it exists and isn't just '/'
    return url.hostname + (url.pathname !== '/' ? url.pathname : '');
  } catch (error) {
    // If URL parsing fails, the domain is invalid
    return undefined;
  }
};
