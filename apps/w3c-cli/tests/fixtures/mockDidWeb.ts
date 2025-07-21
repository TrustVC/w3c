import { DidWellKnownDocument, PrivateKeyPair, VerificationType } from '@trustvc/w3c-issuer';

export const mockKeyPair = Object.freeze({
  id: 'did:web:trustvc.github.io:did:1#keys-1',
  type: VerificationType.Bls12381G2Key2020,
  controller: 'did:web:trustvc.github.io:did:1',
  seedBase58: 'GWP69tmSWJjqC1RoJ27FehcVqkVyeYAz6h5ABwoNSNdS',
  privateKeyBase58: '4LDU56PUhA9ZEutnR1qCWQnUhtLtpLu2EHSq4h1o7vtF',
  publicKeyBase58:
    'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
} as PrivateKeyPair);

export const mockWellKnown = Object.freeze({
  id: 'did:web:trustvc.github.io:did:1',
  verificationMethod: [
    {
      type: 'Bls12381G2Key2020',
      id: 'did:web:trustvc.github.io:did:1#keys-1',
      controller: 'did:web:trustvc.github.io:did:1',
      publicKeyBase58:
        'oRfEeWFresvhRtXCkihZbxyoi2JER7gHTJ5psXhHsdCoU1MttRMi3Yp9b9fpjmKh7bMgfWKLESiK2YovRd8KGzJsGuamoAXfqDDVhckxuc9nmsJ84skCSTijKeU4pfAcxeJ',
    },
  ],
  '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/bls12381-2020/v1'],
  authentication: ['did:web:trustvc.github.io:did:1#keys-1'],
  assertionMethod: ['did:web:trustvc.github.io:did:1#keys-1'],
  capabilityInvocation: ['did:web:trustvc.github.io:did:1#keys-1'],
  capabilityDelegation: ['did:web:trustvc.github.io:did:1#keys-1'],
} as DidWellKnownDocument);
