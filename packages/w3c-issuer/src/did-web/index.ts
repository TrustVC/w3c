// import { getDomainHostname, parseMultibase } from '@tradetrust-tt/w3c-utils';
import { Bls12381G2Key2020 } from '@transmute/bls12381-key-pair/dist/types';
import * as bls12381 from '@transmute/did-key-bls12381';
import * as ed25519 from '@transmute/did-key-ed25519';
import { Ed25519VerificationKey2018 } from '@transmute/ed25519-key-pair/dist/types';
import crypto from 'crypto';
import { Resolver, VerificationMethod } from 'did-resolver';
import web from 'web-did-resolver';
import {
  DidKeyPair,
  DidPrivateKeyPair,
  DidWellKnownDocument,
  GeneratedKeyPairType as GeneratedKeyPair,
  GenerateKeyPairType as GenerateKeyPairOptions,
  KeyPairType,
  VerificationType,
  WellKnownAttribute,
  WellKnownEnum,
} from './type';

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

/**
 * Generate key pair based on the type.
 * If seed is provided, it will be used to generate the key pair.
 * If private key and public key are provided, it will be verified against the generated seed's key pair.
 * 
 * @param {GenerateKeyPairOptions} keyPairOptions
 * @param {VerificationType} keyPairOptions.type - Type of key pair to generate
 * @param {string} keyPairOptions.seedBase58 - Seed in base58 format (optional)
 * @param {string} keyPairOptions.privateKeyBase58 - Private key in base58 format (optional)
 * @param {string} keyPairOptions.publicKeyBase58 - Public key in base58 format (optional)
 * @returns {Promise<GeneratedKeyPair>} - Generated key pair
 */
export const generateKeyPair = async (
  keyPairOptions: GenerateKeyPairOptions,
): Promise<GeneratedKeyPair> => {
  const { seedBase58, privateKeyBase58, publicKeyBase58, type } =
    keyPairOptions;

  let seed: Uint8Array | undefined;
  if (seedBase58) {
    seed = await parseMultibase('z' + seedBase58);
  }
  keyPairOptions.seed = seed ?? Uint8Array.from(crypto.randomBytes(32));

  let generatedKeyPair: GeneratedKeyPair;
  switch (type) {
    case VerificationType.Ed25519VerificationKey2018:
      generatedKeyPair = await generateEd25519KeyPair(keyPairOptions);
      break;
    case VerificationType.Bls12381G2Key2020:
      generatedKeyPair = await generateBls12381KeyPair(keyPairOptions);
      break;
    default:
      throw new Error('Unsupported key pair type');
  }

  // If seed is provided, check against provided private key and public key
  if (seedBase58 && privateKeyBase58) {
    if (privateKeyBase58 !== generatedKeyPair.privateKeyBase58) {
      throw new Error('Private key does not match');
    }
  }
  if (seedBase58 && publicKeyBase58) {
    if (publicKeyBase58 !== generatedKeyPair.publicKeyBase58) {
      throw new Error('Public key does not match');
    }
  }

  return generatedKeyPair;
};

/**
 * Generate Ed25519 key pair based on the seed.
 * 
 * @param {Uint8Array} seed - Seed to generate the key pair
 * @returns {Promise<GeneratedKeyPair>} - Generated Ed25519 key pair
 */
export const generateEd25519KeyPair = async ({
  seed,
}: Readonly<GenerateKeyPairOptions>): Promise<GeneratedKeyPair> => {
  if (!seed) {
    throw new Error('Invalid seed');
  }

  const keys = await ed25519.Ed25519KeyPair.generate({
    secureRandom: () => {
      return seed!;
    },
  });

  const edKeyPair = (await keys.export({
    type: 'Ed25519VerificationKey2018',
    privateKey: true,
  })) as Ed25519VerificationKey2018;
  const base58 = await import('multiformats/bases/base58');

  return {
    type: VerificationType.Ed25519VerificationKey2018,
    seed,
    seedBase58: base58.base58btc.encode(seed!).slice(1),
    privateKey: keys.privateKey,
    privateKeyBase58: edKeyPair.privateKeyBase58,
    publicKey: keys.publicKey,
    publicKeyBase58: edKeyPair.publicKeyBase58,
  };
};

/**
 * Generate Bls12381 key pair based on the seed.
 * 
 * @param {Uint8Array} seed - Seed to generate the key pair
 * @returns {Promise<GeneratedKeyPair>} - Generated Bls12381 key pair
 */
export const generateBls12381KeyPair = async ({
  seed,
}: GenerateKeyPairOptions): Promise<GeneratedKeyPair> => {
  if (!seed) {
    throw new Error('Invalid seed');
  }

  // const bbsKeyPair = await generateBls12381G2KeyPair(seed)

  // Transmute
  const keys = await bls12381.Bls12381KeyPairs.generate({
    secureRandom: () => {
      return seed;
    },
  });

  const g2KeyPair = (await keys.g2KeyPair.export({
    type: 'Bls12381G2Key2020',
    privateKey: true,
  })) as Bls12381G2Key2020;
  const base58 = await import('multiformats/bases/base58');

  const bbsKeyPair: GeneratedKeyPair = {
    type: VerificationType.Bls12381G2Key2020,
    seed: seed,
    seedBase58: base58.base58btc.encode(seed!).slice(1),
    privateKey: keys.g2KeyPair.privateKey,
    privateKeyBase58: g2KeyPair.privateKeyBase58,
    publicKey: keys.g2KeyPair.publicKey,
    publicKeyBase58: g2KeyPair.publicKeyBase58,
  };

  return bbsKeyPair;
};

/**
 * Query well known DID document based on the domain.
 * 
 * @param {string} domain - Domain to query well known DID @example https://subdomain.example.com/xxx
 * @returns {Promise<DidWellKnownDocument | undefined>} - Returns WellKnown DIDDocument if found, otherwise undefined
 */
export const queryWellKnownDid = async (
  domain: string,
): Promise<DidWellKnownDocument | undefined> => {
  const resolver = new Resolver({
    ...web.getResolver(),
  });

  const doc = await resolver.resolve(`did:web:${getDomainHostname(domain)!}`);

  return doc.didDocument as DidWellKnownDocument;
};

/**
 * Generate well known DID document based on the well known DID document and new key pair.
 * 
 * @param {DidWellKnownDocument} wellKnown - Well known DID document
 * @param {DidKeyPair} newKeyPair - New key pair to add to the well known DID document
 * @returns {DidWellKnownDocument} - Updated well known DID document
 */
export const generateWellKnownDid = ({
  wellKnown,
  newKeyPair,
}: {
  wellKnown?: DidWellKnownDocument;
  newKeyPair: DidKeyPair;
}): DidWellKnownDocument => {
  if (!newKeyPair) {
    return;
  }

  if (!wellKnown) {
    wellKnown = {
      id: newKeyPair?.controller,
      [WellKnownEnum.VERIFICATION_METHOD]: [],
      '@context': ['https://www.w3.org/ns/did/v1'],
    };
  }

  // Context
  const context = [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/bls12381-2020/v1',
  ];
  if (!wellKnown['@context']) {
    wellKnown['@context'] = context;
  } else {
    if (typeof wellKnown['@context'] === 'string') {
      wellKnown['@context'] = [wellKnown['@context']];
    }
    for (const c of context) {
      if (!wellKnown['@context'].includes(c)) {
        wellKnown['@context'].push(c);
      }
    }
  }

  // Verification Method
  const newVerificationMethod: VerificationMethod = {
    type: newKeyPair.type,
    id: newKeyPair.id,
    controller: newKeyPair.controller,
    publicKeyBase58: newKeyPair.publicKeyBase58,
  };
  if (!wellKnown[WellKnownEnum.VERIFICATION_METHOD]) {
    wellKnown[WellKnownEnum.VERIFICATION_METHOD] = [newVerificationMethod];
  } else if (
    !wellKnown[WellKnownEnum.VERIFICATION_METHOD]?.find(
      (s) => s?.id === newVerificationMethod?.id,
    )
  ) {
    wellKnown[WellKnownEnum.VERIFICATION_METHOD].push(newVerificationMethod);
  }


  for (const type of WellKnownAttribute) {
    if (!wellKnown[type]) {
      wellKnown[type] = [newVerificationMethod?.id];
    } else {
      if (!wellKnown[type]?.includes(newVerificationMethod?.id))
        wellKnown[type].push(newVerificationMethod?.id);
    }
  }

  return wellKnown;
};

export const issueDID = async (didInput: KeyPairType) => {
  const domainHostname = getDomainHostname(didInput?.domain);
  if (!domainHostname) {
    throw new Error('Invalid / Missing domain');
  }

  const did = `did:web:${domainHostname}`;

  let wellKnown = await queryWellKnownDid(didInput.domain);
  const keyId = (wellKnown?.verificationMethod?.length ?? 0) + 1;

  const generatedKeyPair = await generateKeyPair(didInput);

  const keyPairs: DidPrivateKeyPair = {
    id: `${did}#keys-${keyId}`,
    type: generatedKeyPair.type,
    controller: did,
    seedBase58: generatedKeyPair.seedBase58!,
    privateKeyBase58: generatedKeyPair.privateKeyBase58!,
    publicKeyBase58: generatedKeyPair.publicKeyBase58!,
  };

  wellKnown = generateWellKnownDid({
    wellKnown,
    newKeyPair: keyPairs,
  });

  return {
    wellKnown,
    did: keyPairs,
  };
};

export * from './type';
