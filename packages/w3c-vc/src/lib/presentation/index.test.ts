import { beforeAll, describe, expect, it } from 'vitest';
import {
  createPresentation,
  isRawPresentation,
  isSignedPresentation,
  signPresentation,
  verifyPresentation,
} from './index';
import { deriveCredential, signCredential } from '../w3c-vc';
import { SignedVerifiableCredential } from '../types';
import {
  bbs2020KeyPair,
  bbs2023DidKeyPair,
  BBS_DID_KEY_ISSUER,
  ecdsa2023DidKeyPair,
  ecdsa2023KeyPair,
  ECDSA_DID_KEY_ISSUER,
} from '../__fixtures__/key-pairs';
import { modernCredentialV1_1, modernCredentialV2_0 } from '../__fixtures__/modern-credentials';

const CHALLENGE = 'test-challenge-abc123';
const DOMAIN = 'verifier.example.com';

/** Asserts a value is defined and returns it narrowed (avoids `!` assertions). */
const assertDefined = <T>(value: T | undefined, message: string): T => {
  if (value === undefined) throw new Error(message);
  return value;
};

/**
 * Signs a credential and derives it (selective disclosure) so it is a
 * verifiable, holder-presentable credential.
 */
const makeDerivedCredential = async (
  credential: object,
  keyPair: object,
  cryptosuite: 'ecdsa-sd-2023' | 'bbs-2023',
): Promise<SignedVerifiableCredential> => {
  const signed = await signCredential(credential as never, keyPair as never, cryptosuite);
  if (signed.error) throw new Error(`sign failed: ${signed.error}`);
  const derived = await deriveCredential(
    assertDefined(signed.signed, 'expected signed credential'),
    ['/credentialSubject/blNumber'],
  );
  if (derived.error) throw new Error(`derive failed: ${derived.error}`);
  return assertDefined(derived.derived, 'expected derived credential');
};

/** Signs a credential (base proof) without deriving, so it retains all fields. */
const makeSignedCredential = async (
  credential: object,
  keyPair: object,
  cryptosuite: 'ecdsa-sd-2023' | 'bbs-2023',
): Promise<SignedVerifiableCredential> => {
  const signed = await signCredential(credential as never, keyPair as never, cryptosuite);
  if (signed.error) throw new Error(`sign failed: ${signed.error}`);
  return assertDefined(signed.signed, 'expected signed credential');
};

describe('Verifiable Presentation', () => {
  let ecdsaV2Vc: SignedVerifiableCredential; // ecdsa-sd-2023, v2.0
  let bbsV1Vc: SignedVerifiableCredential; // bbs-2023, v1.1

  beforeAll(async () => {
    ecdsaV2Vc = await makeDerivedCredential(
      { ...modernCredentialV2_0, issuer: ECDSA_DID_KEY_ISSUER, validFrom: '2024-04-01T12:19:52Z' },
      ecdsa2023DidKeyPair,
      'ecdsa-sd-2023',
    );
    bbsV1Vc = await makeDerivedCredential(
      {
        ...modernCredentialV1_1,
        issuer: BBS_DID_KEY_ISSUER,
        issuanceDate: '2024-04-01T12:19:52Z',
      },
      bbs2023DidKeyPair,
      'bbs-2023',
    );
  });

  describe('createPresentation', () => {
    it('wraps a single credential into a VerifiablePresentation envelope', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: bbs2020KeyPair.controller });
      expect(vp.type).toContain('VerifiablePresentation');
      expect(vp.verifiableCredential).toEqual([ecdsaV2Vc]);
      expect(vp.holder).toBe(bbs2020KeyPair.controller);
      expect(vp.proof).toBeUndefined();
      expect(vp.validFrom).toBeDefined(); // mandatory expiry stamp
      expect(vp.validUntil).toBeDefined();
      expect(isRawPresentation(vp)).toBe(true);
      expect(isSignedPresentation(vp)).toBe(false);
    });

    it('stamps a configurable expiry (validUntil = validFrom + expiresInSeconds)', async () => {
      const now = new Date('2026-01-01T00:00:00Z');
      const vp = await createPresentation(ecdsaV2Vc, {
        holder: ECDSA_DID_KEY_ISSUER,
        now,
        expiresInSeconds: 600,
      });
      expect(vp.validFrom).toBe('2026-01-01T00:00:00.000Z');
      expect(vp.validUntil).toBe('2026-01-01T00:10:00.000Z');
    });

    it('rejects a malformed validFrom', async () => {
      await expect(
        createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER, validFrom: 'not-a-date' }),
      ).rejects.toThrow(/"validFrom" is not a valid ISO date-time/);
    });

    it('rejects a validUntil that is not after validFrom (born-expired VP)', async () => {
      await expect(
        createPresentation(ecdsaV2Vc, {
          holder: ECDSA_DID_KEY_ISSUER,
          validFrom: '2026-01-01T00:00:00Z',
          validUntil: '2025-01-01T00:00:00Z',
        }),
      ).rejects.toThrow(/must be a valid time after "validFrom"/);
    });

    it('wraps multiple credentials of different suites/versions', async () => {
      const vp = await createPresentation([ecdsaV2Vc, bbsV1Vc]);
      expect(vp.verifiableCredential).toHaveLength(2);
    });

    it('defaults to a v2 envelope even for a v1.1 credential', async () => {
      const vp = await createPresentation(bbsV1Vc, { holder: BBS_DID_KEY_ISSUER });
      expect((vp['@context'] as string[])[0]).toBe('https://www.w3.org/ns/credentials/v2');
      expect(vp.validFrom).toBeDefined();
      expect(vp.validUntil).toBeDefined();
      expect(vp.issuanceDate).toBeUndefined();
    });

    it('emits a v1.1 envelope when version: "v1" is requested', async () => {
      const vp = await createPresentation(bbsV1Vc, { holder: BBS_DID_KEY_ISSUER, version: 'v1' });
      expect((vp['@context'] as string[])[0]).toBe('https://www.w3.org/2018/credentials/v1');
      expect(vp.issuanceDate).toBeDefined();
      expect(vp.expirationDate).toBeDefined();
      expect(vp.validUntil).toBeUndefined();
    });

    it('throws when no credential is provided', async () => {
      await expect(createPresentation([] as never)).rejects.toThrow();
    });

    it('throws when a credential is unsigned', async () => {
      const { proof: _proof, ...unsigned } = ecdsaV2Vc;
      await expect(createPresentation(unsigned as never)).rejects.toThrow(/signed/);
    });
  });

  describe('createPresentation — holder-binding consistency check (opt-in)', () => {
    const withSubject = (subjectId: string) =>
      makeDerivedCredential(
        {
          ...modernCredentialV2_0,
          issuer: ECDSA_DID_KEY_ISSUER,
          validFrom: '2024-04-01T12:19:52Z',
          credentialSubject: {
            ...(modernCredentialV2_0.credentialSubject as object),
            id: subjectId,
          },
        },
        ecdsa2023DidKeyPair,
        'ecdsa-sd-2023',
      );

    it('passes when every credential is about the holder', async () => {
      const vc = await withSubject(ECDSA_DID_KEY_ISSUER);
      const vp = await createPresentation([vc], {
        holder: ECDSA_DID_KEY_ISSUER,
        checkHolderBinding: true,
      });
      expect(vp.verifiableCredential).toHaveLength(1);
    });

    it('throws when a credential is about someone else', async () => {
      const vc = await withSubject('did:example:someone-else');
      await expect(
        createPresentation(vc, { holder: ECDSA_DID_KEY_ISSUER, checkHolderBinding: true }),
      ).rejects.toThrow(/does not match the holder/);
    });

    it('throws when a credential has no credentialSubject.id', async () => {
      // ecdsaV2Vc has no subject id
      await expect(
        createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER, checkHolderBinding: true }),
      ).rejects.toThrow(/no "credentialSubject.id"/);
    });
  });

  describe('signPresentation — checkHolderBinding (correct signing key)', () => {
    // A credential actually bound to the ECDSA did:key holder (subject id set).
    const boundVc = () =>
      makeDerivedCredential(
        {
          ...modernCredentialV2_0,
          issuer: ECDSA_DID_KEY_ISSUER,
          validFrom: '2024-04-01T12:19:52Z',
          credentialSubject: {
            ...(modernCredentialV2_0.credentialSubject as object),
            id: ECDSA_DID_KEY_ISSUER,
          },
        },
        ecdsa2023DidKeyPair,
        'ecdsa-sd-2023',
      );

    it('signs when the key DID matches the holder and subject', async () => {
      const vc = await boundVc();
      const vp = await createPresentation(vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed, error } = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
        checkHolderBinding: true,
      });
      expect(error).toBeUndefined();
      expect(signed).toBeDefined();
    });

    it('refuses to sign with a key that does not match the holder', async () => {
      // holder claims someone else, but we sign with the ecdsa did:key
      const vp = await createPresentation(ecdsaV2Vc, { holder: 'did:example:someone-else' });
      const { signed, error } = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
        checkHolderBinding: true,
      });
      expect(signed).toBeUndefined();
      expect(error).toMatch(/does not match the presentation holder/);
    });

    it('refuses to sign (does not silently pass) when a credential has no subject id', async () => {
      // ecdsaV2Vc has no credentialSubject.id — holder binding cannot be established.
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed, error } = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
        checkHolderBinding: true,
      });
      expect(signed).toBeUndefined();
      expect(error).toMatch(/no "credentialSubject.id"/);
    });
  });

  describe('signPresentation + verifyPresentation (ecdsa-rdfc-2019 holder proof)', () => {
    it('signs a VP and verifies it, including challenge/domain', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const result = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
        domain: DOMAIN,
      });
      expect(result.error).toBeUndefined();
      expect(result.signed?.proof?.type).toBe('DataIntegrityProof');
      expect(result.signed?.proof?.cryptosuite).toBe('ecdsa-rdfc-2019');
      expect(result.signed?.proof?.challenge).toBe(CHALLENGE);
      expect(isSignedPresentation(result.signed)).toBe(true);

      const verified = await verifyPresentation(
        assertDefined(result.signed, 'expected signed VP'),
        {
          challenge: CHALLENGE,
          domain: DOMAIN,
        },
      );
      expect(verified.verified).toBe(true);
      expect(verified.presentationResult?.verified).toBe(true);
      expect(verified.credentialResults?.every((r) => r.verified)).toBe(true);
    });

    it('verifies a VP mixing ecdsa-sd-2023 (v2) and bbs-2023 (v1) credentials', async () => {
      const vp = await createPresentation([ecdsaV2Vc, bbsV1Vc], {
        holder: ECDSA_DID_KEY_ISSUER,
      });
      const { signed, error } = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
      });
      expect(error).toBeUndefined();

      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
      });
      expect(verified.verified).toBe(true);
      expect(verified.credentialResults).toHaveLength(2);
      expect(verified.credentialResults?.every((r) => r.verified)).toBe(true);
    });

    it('fails verification when the challenge does not match', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });

      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: 'wrong-challenge',
      });
      expect(verified.verified).toBe(false);
      expect(verified.presentationResult?.verified).toBe(false);
    });

    it('requires a caller-supplied challenge to verify a signed VP (no fallback to proof.challenge)', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });

      // No challenge passed on verify — must fail even though proof.challenge exists.
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {});
      expect(verified.verified).toBe(false);
      expect(verified.presentationResult?.verified).toBe(false);
      expect(verified.error).toMatch(/caller-supplied "challenge" is required/);
    });

    it('fails verification when the domain does not match', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
        domain: DOMAIN,
      });

      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
        domain: 'attacker.example',
      });
      expect(verified.verified).toBe(false);
    });

    it('fails verification when an embedded credential is tampered with', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });

      // Tamper: mutate a disclosed claim on the embedded credential.
      const tampered = JSON.parse(JSON.stringify(signed));
      tampered.verifiableCredential[0].credentialSubject.blNumber = 'TAMPERED';

      const verified = await verifyPresentation(tampered, { challenge: CHALLENGE });
      expect(verified.verified).toBe(false);
    });
  });

  describe('signPresentation rejects unsupported suites / keys', () => {
    it('rejects ecdsa-sd-2023 for the presentation proof with an explanatory error', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const result = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
        cryptoSuite: 'ecdsa-sd-2023' as never,
      });
      expect(result.signed).toBeUndefined();
      expect(result.error).toMatch(/cannot sign a Verifiable Presentation/);
    });

    it('rejects bbs-2023 for the presentation proof', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const result = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
        cryptoSuite: 'bbs-2023' as never,
      });
      expect(result.signed).toBeUndefined();
      expect(result.error).toMatch(/cannot sign a Verifiable Presentation/);
    });

    it('rejects a BBS key (only an ECDSA key can produce the presentation proof)', async () => {
      const vp = await createPresentation(bbsV1Vc, { holder: BBS_DID_KEY_ISSUER });
      const result = await signPresentation(vp, bbs2023DidKeyPair, { challenge: CHALLENGE });
      expect(result.signed).toBeUndefined();
      expect(result.error).toMatch(/ECDSA/);
    });

    it('rejects a domain without a challenge', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const result = await signPresentation(vp, ecdsa2023DidKeyPair, { domain: 'x.example' });
      expect(result.signed).toBeUndefined();
      expect(result.error).toMatch(/"domain" requires a "challenge"/);
    });

    it('returns a clear error when no key is provided', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const result = await signPresentation(vp, undefined as never, { challenge: CHALLENGE });
      expect(result.signed).toBeUndefined();
      expect(result.error).toMatch(/signing key \(keyPair\) is required/);
    });
  });

  describe('signing without a challenge (assertionMethod proof, no challenge/domain)', () => {
    it('signs with no challenge/domain and verifies without a challenge', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed, error } = await signPresentation(vp, ecdsa2023DidKeyPair);
      expect(error).toBeUndefined();
      expect(signed?.proof?.proofPurpose).toBe('assertionMethod');
      expect(signed?.proof?.challenge).toBeUndefined();
      expect(signed?.proof?.domain).toBeUndefined();

      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {});
      expect(verified.verified).toBe(true);
      expect(verified.presentationResult?.verified).toBe(true);
    });

    it('still supports holder binding on an assertion proof', async () => {
      const vc = await makeDerivedCredential(
        {
          ...modernCredentialV2_0,
          issuer: ECDSA_DID_KEY_ISSUER,
          validFrom: '2024-04-01T12:19:52Z',
          credentialSubject: {
            ...(modernCredentialV2_0.credentialSubject as object),
            id: ECDSA_DID_KEY_ISSUER,
          },
        },
        ecdsa2023DidKeyPair,
        'ecdsa-sd-2023',
      );
      const vp = await createPresentation(vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair); // no challenge
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        checkHolderBinding: true,
      });
      expect(verified.verified).toBe(true);
    });
  });

  describe('rejects TransferableRecords credentials', () => {
    let transferableRecordVc: SignedVerifiableCredential;

    beforeAll(async () => {
      // The modern credential fixtures carry a TransferableRecords credentialStatus;
      // a base (non-derived) signature retains it.
      transferableRecordVc = await makeSignedCredential(
        {
          ...modernCredentialV2_0,
          issuer: ECDSA_DID_KEY_ISSUER,
          validFrom: '2024-04-01T12:19:52Z',
        },
        ecdsa2023DidKeyPair,
        'ecdsa-sd-2023',
      );
      expect(transferableRecordVc.credentialStatus).toBeDefined();
    });

    it('createPresentation throws for a TransferableRecords credential', async () => {
      await expect(createPresentation(transferableRecordVc)).rejects.toThrow(/TransferableRecords/);
    });

    it('createPresentation throws when any credential in the list is a TransferableRecord', async () => {
      await expect(createPresentation([ecdsaV2Vc, transferableRecordVc])).rejects.toThrow(
        /TransferableRecords/,
      );
    });

    it('signPresentation errors for a hand-built VP containing a TransferableRecords credential', async () => {
      const vp = {
        '@context': [
          'https://www.w3.org/ns/credentials/v2',
          'https://w3id.org/security/data-integrity/v2',
        ],
        type: ['VerifiablePresentation'],
        holder: ECDSA_DID_KEY_ISSUER,
        verifiableCredential: [transferableRecordVc],
      };
      const result = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });
      expect(result.signed).toBeUndefined();
      expect(result.error).toMatch(/TransferableRecords/);
    });
  });

  describe('fullDisclosure: auto-derive non-derived credentials when signing', () => {
    // A source credential WITHOUT TransferableRecords (so the VP rule allows it).
    const noTrSource = () => {
      const {
        credentialStatus: _credentialStatus,
        qrCode: _qrCode,
        renderMethod: _renderMethod,
        ...rest
      }: Record<string, unknown> = JSON.parse(JSON.stringify(modernCredentialV2_0));
      return {
        ...rest,
        issuer: ECDSA_DID_KEY_ISSUER,
        validFrom: '2024-04-01T12:19:52Z',
        credentialSubject: {
          ...(rest.credentialSubject as object),
          id: ECDSA_DID_KEY_ISSUER,
        },
      };
    };

    it('a base (non-derived) credential is REJECTED at creation without fullDisclosure', async () => {
      const base = await makeSignedCredential(noTrSource(), ecdsa2023DidKeyPair, 'ecdsa-sd-2023');
      await expect(createPresentation(base, { holder: ECDSA_DID_KEY_ISSUER })).rejects.toThrow(
        /must be derived/,
      );
    });

    it('fullDisclosure auto-derives the base credential so the VP is created and verifies', async () => {
      const base = await makeSignedCredential(noTrSource(), ecdsa2023DidKeyPair, 'ecdsa-sd-2023');
      const vp = await createPresentation(base, {
        holder: ECDSA_DID_KEY_ISSUER,
        fullDisclosure: true,
      });

      const embedded = vp.verifiableCredential;
      const first = Array.isArray(embedded) ? embedded[0] : embedded;
      // The base credential was replaced with its derived (verifiable) form, disclosing all fields.
      expect(first?.credentialSubject).toBeDefined();
      expect((first?.credentialSubject as Record<string, unknown>).blNumber).toBe('SGCNM21566325');

      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
      });
      expect(verified.verified).toBe(true);
    });

    it('leaves already-derived credentials untouched under fullDisclosure', async () => {
      const vp = await createPresentation(ecdsaV2Vc, {
        holder: ECDSA_DID_KEY_ISSUER,
        fullDisclosure: true,
      });
      const { signed, error } = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
      });
      expect(error).toBeUndefined();
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
      });
      expect(verified.verified).toBe(true);
    });
  });

  describe('VP expiry & strict creation-time validation', () => {
    it('rejects an expired VP at verify time', async () => {
      const created = new Date('2026-01-01T00:00:00Z');
      const vp = await createPresentation(ecdsaV2Vc, {
        holder: ECDSA_DID_KEY_ISSUER,
        now: created,
        expiresInSeconds: 60,
      });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });

      // Verify 2 minutes later — past validUntil.
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
        now: new Date('2026-01-01T00:02:00Z'),
      });
      expect(verified.verified).toBe(false);
      expect(verified.error).toMatch(/has expired/);
    });

    it('enforces maxLifetimeSeconds at verify time', async () => {
      const vp = await createPresentation(ecdsaV2Vc, {
        holder: ECDSA_DID_KEY_ISSUER,
        expiresInSeconds: 3600, // 1 hour
      });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });

      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
        maxLifetimeSeconds: 300, // only accept <= 5 min
      });
      expect(verified.verified).toBe(false);
      expect(verified.error).toMatch(/exceeds the maximum allowed/);
    });

    it('rejects an EXPIRED input credential at creation (no VP produced)', async () => {
      // modernCredentialV2_0 has validUntil 2029; reveal it, then treat "now" as 2030.
      const signed = await signCredential(
        {
          ...modernCredentialV2_0,
          issuer: ECDSA_DID_KEY_ISSUER,
          validFrom: '2024-04-01T12:19:52Z',
        },
        ecdsa2023DidKeyPair,
        'ecdsa-sd-2023',
      );
      const derived = await deriveCredential(assertDefined(signed.signed, 'signed'), [
        '/credentialSubject/blNumber',
        '/validUntil',
      ]);
      const expiredVc = assertDefined(derived.derived, 'derived');
      expect(expiredVc.validUntil).toBeDefined();

      await expect(
        createPresentation(expiredVc, {
          holder: ECDSA_DID_KEY_ISSUER,
          now: new Date('2030-01-01T00:00:00Z'),
        }),
      ).rejects.toThrow(/has expired/);
    });

    it('rejects a VP at VERIFY when an embedded credential has expired (consistent with creation)', async () => {
      // Build a VP whose embedded credential expires in 2021, created in 2020 (so creation passes).
      const signed = await signCredential(
        {
          ...modernCredentialV2_0,
          issuer: ECDSA_DID_KEY_ISSUER,
          validFrom: '2020-01-01T00:00:00Z',
          validUntil: '2021-01-01T00:00:00Z',
        },
        ecdsa2023DidKeyPair,
        'ecdsa-sd-2023',
      );
      const expiredVc = assertDefined(
        (await deriveCredential(assertDefined(signed.signed, 'signed'), ['/validUntil'])).derived,
        'derived',
      );
      // create in 2020 (VC still valid then) with a long VP lifetime so the VP itself isn't expired.
      const vp = await createPresentation(expiredVc, {
        holder: ECDSA_DID_KEY_ISSUER,
        now: new Date('2020-06-01T00:00:00Z'),
        expiresInSeconds: 315360000, // 10 years
      });
      const { signed: signedVp } = await signPresentation(vp, ecdsa2023DidKeyPair, {
        challenge: CHALLENGE,
      });

      // Verify "now" (2026): the embedded credential is expired → VP must fail.
      const verified = await verifyPresentation(assertDefined(signedVp, 'signed VP'), {
        challenge: CHALLENGE,
      });
      expect(verified.verified).toBe(false);
      expect(verified.credentialResults?.[0].verified).toBe(false);
      expect(verified.credentialResults?.[0].error).toMatch(/has expired/);
    });
  });

  describe('unsigned presentations', () => {
    it('verifies embedded credentials of an unsigned VP (no holder proof)', async () => {
      const vp = await createPresentation([ecdsaV2Vc, bbsV1Vc]);
      const verified = await verifyPresentation(vp, {});
      expect(verified.verified).toBe(true);
      expect(verified.presentationResult).toBeUndefined();
      expect(verified.credentialResults).toHaveLength(2);
    });

    it('rejects an unsigned VP when requireProof is set', async () => {
      const vp = await createPresentation([ecdsaV2Vc, bbsV1Vc]);
      const verified = await verifyPresentation(vp, { requireProof: true });
      expect(verified.verified).toBe(false);
      expect(verified.error).toMatch(/holder proof is required/);
    });

    it('accepts a signed VP when requireProof is set (with challenge)', async () => {
      const vp = await createPresentation(ecdsaV2Vc, { holder: ECDSA_DID_KEY_ISSUER });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        requireProof: true,
        challenge: CHALLENGE,
      });
      expect(verified.verified).toBe(true);
    });

    it('rejects at creation when an embedded credential is invalid (strict)', async () => {
      const tampered = JSON.parse(JSON.stringify(ecdsaV2Vc));
      tampered.credentialSubject.blNumber = 'TAMPERED';
      // Strict creation: an invalid credential fails createPresentation — no VP is produced.
      await expect(createPresentation(tampered)).rejects.toThrow(/is not valid/);
    });
  });

  describe('holder binding (proves the presenter owns the credentials)', () => {
    // Builds a derived credential whose credentialSubject.id is `subjectId`.
    const credWithSubject = (subjectId: string) =>
      makeDerivedCredential(
        {
          ...modernCredentialV2_0,
          issuer: ECDSA_DID_KEY_ISSUER,
          validFrom: '2024-04-01T12:19:52Z',
          credentialSubject: {
            ...(modernCredentialV2_0.credentialSubject as object),
            id: subjectId,
          },
        },
        ecdsa2023DidKeyPair,
        'ecdsa-sd-2023',
      );

    // The holder key (ecdsa2023DidKeyPair) signs with this DID:
    const SIGNER_DID = ECDSA_DID_KEY_ISSUER;

    it('passes when the signer DID == holder == every credentialSubject.id', async () => {
      const vc = await credWithSubject(SIGNER_DID);
      const vp = await createPresentation(vc, { holder: SIGNER_DID });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
        checkHolderBinding: true,
      });
      expect(verified.verified).toBe(true);
    });

    it('fails when the presentation is signed by someone other than the holder (ownership hole closed)', async () => {
      // credentialSubject.id and holder both claim "alice", but the VP is signed by
      // the ecdsa did:key (not alice). A plain string check would pass; this must fail.
      const vc = await credWithSubject('did:example:alice');
      const vp = await createPresentation(vc, { holder: 'did:example:alice' });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
        checkHolderBinding: true,
      });
      expect(verified.verified).toBe(false);
      expect(verified.error).toMatch(/signed by .* does not match the declared holder/);
    });

    it('fails when a credential is about someone other than the holder/signer', async () => {
      const vc = await credWithSubject('did:example:not-the-holder');
      const vp = await createPresentation(vc, { holder: SIGNER_DID });
      const { signed } = await signPresentation(vp, ecdsa2023DidKeyPair, { challenge: CHALLENGE });
      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
        checkHolderBinding: true,
      });
      expect(verified.verified).toBe(false);
      expect(verified.error).toMatch(/does not match the presentation holder\/signer/);
    });

    it('fails holder binding on an unsigned VP (ownership cannot be proven without a signature)', async () => {
      const vc = await credWithSubject(SIGNER_DID);
      const vp = await createPresentation(vc, { holder: SIGNER_DID });
      const verified = await verifyPresentation(vp, { checkHolderBinding: true });
      expect(verified.verified).toBe(false);
      expect(verified.error).toMatch(/requires a signed presentation/);
    });
  });

  // A did:web holder/subject must work exactly like a did:key one. The only extra
  // requirement is that the did:web resolves (its DID document publishes the ECDSA
  // Multikey). `ecdsa2023KeyPair` is controlled by did:web:trustvc.github.io:did:1,
  // whose DID document is hosted and resolvable by the default document loader —
  // the same did:web the credential tests already sign/verify against.
  describe('did:web holder / credentialSubject.id', () => {
    const WEB_DID = ecdsa2023KeyPair.controller; // did:web:trustvc.github.io:did:1

    const webCredential = () =>
      makeDerivedCredential(
        {
          ...modernCredentialV2_0,
          issuer: WEB_DID,
          validFrom: '2024-04-01T12:19:52Z',
          credentialSubject: {
            ...(modernCredentialV2_0.credentialSubject as object),
            id: WEB_DID,
          },
        },
        ecdsa2023KeyPair,
        'ecdsa-sd-2023',
      );

    it('signs and verifies a VP whose holder/subject is a did:web (with holder binding)', async () => {
      const vc = await webCredential();
      const vp = await createPresentation(vc, { holder: WEB_DID, checkHolderBinding: true });
      const { signed, error } = await signPresentation(vp, ecdsa2023KeyPair, {
        challenge: CHALLENGE,
        domain: DOMAIN,
        checkHolderBinding: true,
      });
      expect(error).toBeUndefined();
      expect(signed?.proof?.cryptosuite).toBe('ecdsa-rdfc-2019');
      expect(signed?.proof?.verificationMethod).toContain(WEB_DID);

      const verified = await verifyPresentation(assertDefined(signed, 'expected signed VP'), {
        challenge: CHALLENGE,
        domain: DOMAIN,
        checkHolderBinding: true,
      });
      expect(verified.verified).toBe(true);
      expect(verified.presentationResult?.verified).toBe(true);
      expect(verified.credentialResults?.every((r) => r.verified)).toBe(true);
    });
  });
});
