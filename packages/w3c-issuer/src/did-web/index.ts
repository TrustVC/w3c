import { Bls12381G2Key2020 } from '@transmute/bls12381-key-pair/dist/types';
import * as bls12381 from '@transmute/did-key-bls12381';
import * as ed25519 from '@transmute/did-key-ed25519';
import { Ed25519VerificationKey2018 } from '@transmute/ed25519-key-pair/dist/types';
import crypto from 'crypto';
import { Resolver } from 'did-resolver';
import web from 'web-did-resolver';
import {
  DidKeyPair,
  DidPrivateKeyPair,
  DidWellKnownDocument,
  GeneratedKeyPairType as GeneratedKeyPair,
  GenerateKeyPairType as GenerateKeyPairOptions,
  KeyPairType,
  SecurityVocabTypeToContext,
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
    case SecurityVocabTypeToContext.Ed25519VerificationKey2018:
      generatedKeyPair = await generateEd25519KeyPair(keyPairOptions);
      break;
    case SecurityVocabTypeToContext.Bls12381G2Key2020:
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
    type: SecurityVocabTypeToContext.Ed25519VerificationKey2018,
    seed,
    seedBase58: base58.base58btc.encode(seed!).slice(1),
    privateKey: keys.privateKey,
    privateKeyBase58: edKeyPair.privateKeyBase58,
    publicKey: keys.publicKey,
    publicKeyBase58: edKeyPair.publicKeyBase58,
  };
};

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
    type: SecurityVocabTypeToContext.Bls12381G2Key2020,
    seed: seed,
    seedBase58: base58.base58btc.encode(seed!).slice(1),
    privateKey: keys.g2KeyPair.privateKey,
    privateKeyBase58: g2KeyPair.privateKeyBase58,
    publicKey: keys.g2KeyPair.publicKey,
    publicKeyBase58: g2KeyPair.publicKeyBase58,
  };

  return bbsKeyPair;
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

export const generateWellKnownDid = async ({
  wellKnown,
  newKeyPair,
}: {
  wellKnown?: DidWellKnownDocument;
  newKeyPair: DidKeyPair;
}) => {
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
  const newVerificationMethod = {
    type: 'Bls12381G2Key2020',
    id: newKeyPair?.id,
    controller: newKeyPair?.controller,
    publicKeyBase58: newKeyPair?.publicKeyBase58,
  };
  if (!wellKnown[WellKnownEnum.VERIFICATION_METHOD]) {
    wellKnown[WellKnownEnum.VERIFICATION_METHOD] = [newVerificationMethod];
  } else if (
    !wellKnown[WellKnownEnum.VERIFICATION_METHOD].find(
      (s) => s?.id === newVerificationMethod?.id,
    )
  ) {
    wellKnown[WellKnownEnum.VERIFICATION_METHOD].push(newVerificationMethod);
  }

  // Assertion Method
  if (!wellKnown[WellKnownEnum.ASSERTION_METHOD]) {
    wellKnown[WellKnownEnum.ASSERTION_METHOD] = [newVerificationMethod?.id];
  } else {
    if (
      !wellKnown[WellKnownEnum.ASSERTION_METHOD].includes(
        newVerificationMethod?.id,
      )
    )
      wellKnown[WellKnownEnum.ASSERTION_METHOD].push(newVerificationMethod?.id);
  }

  // Capability Invocation
  if (!wellKnown[WellKnownEnum.CAPABILITY_INVOCATION]) {
    wellKnown[WellKnownEnum.CAPABILITY_INVOCATION] = [
      newVerificationMethod?.id,
    ];
  } else {
    if (
      !wellKnown[WellKnownEnum.CAPABILITY_INVOCATION].includes(
        newVerificationMethod?.id,
      )
    )
      wellKnown[WellKnownEnum.CAPABILITY_INVOCATION].push(
        newVerificationMethod?.id,
      );
  }

  return wellKnown;
};

export const queryWellKnownDid = async (
  domain: string,
): Promise<DidWellKnownDocument | undefined> => {
  const resolver = new Resolver({
    ...web.getResolver(),
  });

  const doc = await resolver.resolve(`did:web:${getDomainHostname(domain)!}`);

  return doc.didDocument as DidWellKnownDocument;
};

export const issueDID = async (didInput: KeyPairType) => {
  const domainHostname = getDomainHostname(didInput?.domain);
  if (!domainHostname) {
    throw new Error('Invalid / Missing domain');
  }

  const did = `did:web:${domainHostname}`;

  // Query well-known DID
  let wellKnown = await queryWellKnownDid(didInput.domain);
  const keyId = (wellKnown?.verificationMethod?.length ?? 0) + 1;

  const bbsKeyPair = await generateKeyPair(didInput);

  const keyPairs: DidPrivateKeyPair = {
    id: `${did}#keys-${keyId}`,
    type: 'Bls12381G2Key',
    controller: did,
    seedBase58: bbsKeyPair.seedBase58!,
    privateKeyBase58: bbsKeyPair.privateKeyBase58!,
    publicKeyBase58: bbsKeyPair.publicKeyBase58!,
  };

  wellKnown = await generateWellKnownDid({
    wellKnown,
    newKeyPair: keyPairs,
  });

  return {
    wellKnown,
    did: keyPairs,
  };
};

export * from './type';
