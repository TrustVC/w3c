
export const parseMultibase = async (
  multibase: string,
): Promise<Uint8Array> => {
  const [prefix, ..._value] = multibase;

  const { base58btc } = await import('multiformats/bases/base58');
  const { base64, base64pad, base64url, base64urlpad } = await import(
    'multiformats/bases/base64'
  );
  const {
    base32,
    base32hex,
    base32hexpad,
    base32hexpadupper,
    base32hexupper,
    base32pad,
    base32padupper,
    base32upper,
    base32z,
  } = await import('multiformats/bases/base32');
  const { base16, base16upper } = await import('multiformats/bases/base16');

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

export const getDomainHostname = (
  domain: Readonly<string>,
): string | undefined => {
  // convert domain https://example.com/part/index?id=123 to example.com

  if (!domain) {
    return;
  }

  const url = new URL(domain);
  return url.hostname;
};