import {
  Bbs2023PrivateKeyPair,
  BBSPrivateKeyPair,
  EcdsaSd2023PrivateKeyPair,
  VerificationType,
} from '@trustvc/w3c-issuer';

export const bbs2020KeyPair: BBSPrivateKeyPair = {
  id: 'did:web:trustvc.github.io:did:1#keys-1',
  controller: 'did:web:trustvc.github.io:did:1',
  type: VerificationType.Bls12381G2Key2020,
  publicKeyBase58:
    'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
  privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
};

export const ecdsa2023KeyPair: EcdsaSd2023PrivateKeyPair = {
  '@context': 'https://w3id.org/security/multikey/v1',
  id: 'did:web:trustvc.github.io:did:1#multikey-1',
  type: VerificationType.Multikey,
  controller: 'did:web:trustvc.github.io:did:1',
  publicKeyMultibase: 'zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc',
  secretKeyMultibase: 'z42tmUXTVn3n9BihE6NhdMpvVBTnFTgmb6fw18o5Ud6puhRW',
};

export const bbs2023KeyPair: Bbs2023PrivateKeyPair = {
  '@context': 'https://w3id.org/security/multikey/v1',
  id: 'did:web:trustvc.github.io:did:1#multikey-2',
  type: VerificationType.Multikey,
  controller: 'did:web:trustvc.github.io:did:1',
  publicKeyMultibase:
    'zUC7HnpncVAkTjtL6B8prX6bQM2WA5sJ7rXFeCqyrvPnrzoFBjYsVUTNwzhhPUazja73tWwPeEBWCUgq5qBSrtrXiYhVvBCgZPTCiWANj7TSiZJ6SnyC3pkt94GiuChhAvmRRbt',
  secretKeyMultibase: 'z488ur1KSFDd3Y1L6pXcPrZRjE18PNBhgzwJvMeoSxKPNysj',
};

// did:key variants: same key material, but the DID and controller are derived
// from publicKeyMultibase (the multibase IS the DID after `did:key:`).
const ECDSA_PK_MULTIBASE = 'zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc';
const ECDSA_DID_KEY = `did:key:${ECDSA_PK_MULTIBASE}`;

const BBS_PK_MULTIBASE =
  'zUC7HnpncVAkTjtL6B8prX6bQM2WA5sJ7rXFeCqyrvPnrzoFBjYsVUTNwzhhPUazja73tWwPeEBWCUgq5qBSrtrXiYhVvBCgZPTCiWANj7TSiZJ6SnyC3pkt94GiuChhAvmRRbt';
const BBS_DID_KEY = `did:key:${BBS_PK_MULTIBASE}`;

export const ecdsa2023DidKeyPair: EcdsaSd2023PrivateKeyPair = {
  '@context': 'https://w3id.org/security/multikey/v1',
  id: `${ECDSA_DID_KEY}#${ECDSA_PK_MULTIBASE}`,
  type: VerificationType.Multikey,
  controller: ECDSA_DID_KEY,
  publicKeyMultibase: ECDSA_PK_MULTIBASE,
  secretKeyMultibase: 'z42tmUXTVn3n9BihE6NhdMpvVBTnFTgmb6fw18o5Ud6puhRW',
};

export const bbs2023DidKeyPair: Bbs2023PrivateKeyPair = {
  '@context': 'https://w3id.org/security/multikey/v1',
  id: `${BBS_DID_KEY}#${BBS_PK_MULTIBASE}`,
  type: VerificationType.Multikey,
  controller: BBS_DID_KEY,
  publicKeyMultibase: BBS_PK_MULTIBASE,
  secretKeyMultibase: 'z488ur1KSFDd3Y1L6pXcPrZRjE18PNBhgzwJvMeoSxKPNysj',
};

export const ECDSA_DID_KEY_ISSUER = ECDSA_DID_KEY;
export const BBS_DID_KEY_ISSUER = BBS_DID_KEY;
