import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import * as ecdsaRdfc2019Cryptosuite from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';
import {
  DATA_INTEGRITY_V2_URL,
  DocumentLoader,
  getDocumentLoader,
  VC_V1_URL,
  VC_V2_URL,
} from '@trustvc/w3c-context';
import { EcdsaSd2023PrivateKeyPair, PrivateKeyPair } from '@trustvc/w3c-issuer';
import { _checkKeyPair } from '../helper';
import * as jsonld from 'jsonld';
// jsonld-signatures@11 – the version compatible with the @digitalbazaar
// DataIntegrityProof suites (same as the modern VC sign/verify path).
import jsonldSignatures from 'jsonld-signatures';
import {
  CredentialVerificationResult,
  PresentationSigningResult,
  PresentationVerificationResult,
  PresentationProofSuite,
  ProofType,
  RawVerifiablePresentation,
  SignedVerifiableCredential,
  SignedVerifiablePresentation,
  VerifiablePresentation,
} from '../types';
import { deriveCredential, isDerived, verifyCredential } from '../w3c-vc';
import { verifyCredentialStatus } from '../verify/credentialStatus';

const {
  purposes: { AuthenticationProofPurpose, AssertionProofPurpose },
} = jsonldSignatures;

// The cryptosuite used for a presentation's holder-binding proof. Only the plain
// (non-selective-disclosure) `ecdsa-rdfc-2019` suite is supported — it signs the
// whole envelope and reuses the same ECDSA Multikey used for `ecdsa-sd-2023`
// credentials.
const PRESENTATION_PROOF_CRYPTOSUITE = 'ecdsa-rdfc-2019';

// Selective-disclosure cryptosuites cannot sign a presentation: the
// `verifiableCredential` term is a JSON-LD `@graph` container, which the
// JSON-pointer-based selective disclosure primitives cannot address. Signing
// with them either throws or silently drops the credentials from the signed
// payload, so the holder proof would not cover the credentials being presented.
// (Embedded credentials may still use these suites.)
const UNSUPPORTED_PROOF_SUITES = new Set(['ecdsa-sd-2023', 'bbs-2023', 'BbsBlsSignature2020']);

/**
 * Normalises the `verifiableCredential` field into an array of credentials.
 * @param {VerifiablePresentation} presentation - The presentation to read from.
 * @returns {SignedVerifiableCredential[]} The embedded credentials (empty if none).
 */
const getCredentials = (presentation: VerifiablePresentation): SignedVerifiableCredential[] => {
  const vc = presentation?.verifiableCredential;
  if (!vc) {
    return [];
  }
  return Array.isArray(vc) ? vc : [vc];
};

/**
 * Reads the `id` from an object-or-string value (e.g. issuer/holder/subject id).
 * @param {string | Record<string, unknown> | undefined} value - The value to read.
 * @returns {string | undefined} The id, or undefined if absent.
 */
const readId = (value: string | Record<string, unknown> | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  return typeof value === 'string' ? value : (value.id as string | undefined);
};

/**
 * Extracts the DID from a verification method id by stripping the fragment.
 * e.g. `did:key:zAbc#zAbc` -> `did:key:zAbc`.
 * @param {string | undefined} id - The verification method id.
 * @returns {string | undefined} The controller DID, or undefined.
 */
const getDidFromId = (id: string | undefined): string | undefined =>
  id ? id.split('#')[0] : undefined;

/**
 * Returns the first credentialSubject of a credential (credentialSubject may be
 * a single object or an array).
 * @param {SignedVerifiableCredential} credential - The credential to read from.
 * @returns {Record<string, unknown> | undefined} The first subject, if any.
 */
const getFirstSubject = (
  credential: SignedVerifiableCredential,
): Record<string, unknown> | undefined => {
  const subject = credential?.credentialSubject;
  return Array.isArray(subject) ? subject[0] : subject;
};

/**
 * Determines whether a credential carries a TransferableRecords credential
 * status. Such credentials are controlled on-chain via their token registry, so
 * their possession/holder binding is proven by token ownership rather than by a
 * Verifiable Presentation — wrapping them in a VP is therefore disallowed.
 * @param {SignedVerifiableCredential} credential - The credential to inspect.
 * @returns {boolean} True if any credentialStatus is of type TransferableRecords.
 */
const hasTransferableRecords = (credential: SignedVerifiableCredential): boolean => {
  const status = credential?.credentialStatus;
  if (!status) {
    return false;
  }
  const statuses = Array.isArray(status) ? status : [status];
  return statuses.some((entry) => entry?.type === 'TransferableRecords');
};

/**
 * Throws if any credential in the list carries a TransferableRecords status.
 * @param {SignedVerifiableCredential[]} credentials - The credentials to check.
 * @throws {Error} If a TransferableRecords credential is found.
 */
const assertNoTransferableRecords = (credentials: SignedVerifiableCredential[]): void => {
  const index = credentials.findIndex(hasTransferableRecords);
  if (index !== -1) {
    throw new Error(
      `credential at index ${index} has a "TransferableRecords" credentialStatus and cannot be ` +
        `included in a Verifiable Presentation. Transferable records are controlled on-chain via ` +
        `their token registry; present them through their token ownership instead.`,
    );
  }
};

// Selective-disclosure cryptosuites whose base credentials must be derived
// before they can be verified / presented.
const SD_CREDENTIAL_CRYPTOSUITES = ['ecdsa-sd-2023', 'bbs-2023'];

/**
 * Determines whether a credential is a base (non-derived) selective-disclosure
 * credential — i.e. signed with an SD cryptosuite but not yet derived, so it is
 * not directly verifiable.
 * @param {SignedVerifiableCredential} credential - The credential to inspect.
 * @returns {Promise<boolean>} True if it is a base SD credential.
 */
const isBaseSdCredential = async (credential: SignedVerifiableCredential): Promise<boolean> => {
  const cryptosuite = credential?.proof?.cryptosuite as string | undefined;
  if (!cryptosuite || !SD_CREDENTIAL_CRYPTOSUITES.includes(cryptosuite)) {
    return false;
  }
  return !(await isDerived(credential));
};

/**
 * Derives a base selective-disclosure credential revealing ALL of its fields
 * (full disclosure), producing a directly-verifiable derived credential.
 * @param {SignedVerifiableCredential} credential - The base SD credential.
 * @param {DocumentLoader} documentLoader - JSON-LD document loader.
 * @returns {Promise<SignedVerifiableCredential>} The fully-disclosed derived credential.
 * @throws {Error} If derivation fails.
 */
const deriveFullDisclosure = async (
  credential: SignedVerifiableCredential,
  documentLoader: DocumentLoader,
): Promise<SignedVerifiableCredential> => {
  // Reveal every top-level field (pointing at an object reveals it in full).
  const pointers = Object.keys(credential)
    .filter((key) => key !== '@context' && key !== 'proof')
    .map((key) => `/${key}`);
  const result = await deriveCredential(credential, pointers, { documentLoader });
  if (result.error || !result.derived) {
    throw new Error(`failed to derive credential for full disclosure: ${result.error}`);
  }
  return result.derived;
};

// Default Verifiable Presentation lifetime when the caller does not specify one.
const DEFAULT_VP_LIFETIME_SECONDS = 300; // 5 minutes

// The VP-level expiry fields (validFrom/validUntil, issuanceDate/expirationDate) are only
// defined for CREDENTIALS in the VC contexts, not for a VerifiablePresentation. Stamping
// them on the VP without defining them makes the signature canonicalization drop them under
// strict JSON-LD safe mode (jsonld ≥ 9). This inline context defines them (using the
// standard credentials-vocab IRIs) so the VP proof covers them. Added to the VP @context.
const CREDENTIALS_VOCAB = 'https://www.w3.org/2018/credentials#';
const XSD_DATETIME = 'http://www.w3.org/2001/XMLSchema#dateTime';
const dateTerm = (name: string) => ({
  '@id': `${CREDENTIALS_VOCAB}${name}`,
  '@type': XSD_DATETIME,
});
const VP_EXPIRY_CONTEXT = {
  validFrom: dateTerm('validFrom'),
  validUntil: dateTerm('validUntil'),
  issuanceDate: dateTerm('issuanceDate'),
  expirationDate: dateTerm('expirationDate'),
} as const;

/**
 * Reads a credential's temporal validity bounds, supporting both v2.0
 * (validFrom/validUntil) and v1.1 (issuanceDate/expirationDate).
 */
const getValidityBounds = (doc: Record<string, unknown>): { from?: string; until?: string } => ({
  from: (doc.validFrom ?? doc.issuanceDate) as string | undefined,
  until: (doc.validUntil ?? doc.expirationDate) as string | undefined,
});

/**
 * Asserts a credential is temporally valid at `now` (not expired, not future-dated).
 * @throws {Error} If the credential has expired or is not yet valid.
 */
const assertCredentialTemporallyValid = (
  credential: SignedVerifiableCredential,
  index: number,
  now: Date,
): void => {
  const { from, until } = getValidityBounds(credential);
  if (until && now > new Date(until)) {
    throw new Error(`credential at index ${index} has expired (${until}).`);
  }
  if (from && now < new Date(from)) {
    throw new Error(`credential at index ${index} is not yet valid (${from}).`);
  }
};

/**
 * Asserts a credential has not been revoked/suspended via its credentialStatus.
 * Credentials with no status are treated as not revoked. Requires a document
 * loader to fetch the status list.
 * @throws {Error} If the credential is revoked/suspended or its status can't be checked.
 */
const assertCredentialNotRevoked = async (
  credential: SignedVerifiableCredential,
  index: number,
  documentLoader: DocumentLoader,
): Promise<void> => {
  const status = credential.credentialStatus;
  if (!status) {
    return;
  }
  const statuses = Array.isArray(status) ? status : [status];
  for (const entry of statuses) {
    // TransferableRecords are blocked earlier; skip any that slipped through.
    if (!entry?.type || entry.type === 'TransferableRecords') {
      continue;
    }
    const result = await verifyCredentialStatus(
      entry,
      entry.type as Parameters<typeof verifyCredentialStatus>[1],
      { documentLoader },
    );
    if (result.error) {
      throw new Error(`credential at index ${index}: could not verify status: ${result.error}`);
    }
    if (result.status === true) {
      throw new Error(
        `credential at index ${index} has been ${result.purpose ?? 'revoked'} (credentialStatus).`,
      );
    }
  }
};

/**
 * Validates the basic structure of a Verifiable Presentation.
 * @param {VerifiablePresentation} presentation - The presentation to validate.
 * @param {'sign' | 'verify'} mode - Whether the presentation is being signed or verified.
 * @throws {Error} If the presentation is structurally invalid.
 */
const _checkPresentation = (
  presentation: VerifiablePresentation,
  mode: 'sign' | 'verify' = 'verify',
): void => {
  if (!presentation || typeof presentation !== 'object') {
    throw new Error('"presentation" must be an object.');
  }

  const contexts = jsonld.getValues(presentation, '@context');
  if (contexts.length < 1) {
    throw new Error('"@context" property is required.');
  }
  const firstContext = contexts[0];
  if (firstContext !== VC_V1_URL && firstContext !== VC_V2_URL) {
    throw new Error(
      `The first element of '@context' must be either '${VC_V1_URL}' (v1.1) or '${VC_V2_URL}' (v2.0).`,
    );
  }

  if (!presentation.type) {
    throw new Error('"type" property is required.');
  }
  if (!jsonld.getValues(presentation, 'type').includes('VerifiablePresentation')) {
    throw new Error('"type" must include `VerifiablePresentation`.');
  }

  // `verifiableCredential`, when present, must be a credential object or an array of them.
  if ('verifiableCredential' in presentation) {
    const credentials = getCredentials(presentation);
    if (credentials.length === 0) {
      throw new Error('"verifiableCredential" must contain at least one credential.');
    }
    for (const credential of credentials) {
      if (!credential || typeof credential !== 'object') {
        throw new Error('each "verifiableCredential" entry must be a credential object.');
      }
      if (mode === 'verify' && !credential.proof) {
        throw new Error('each "verifiableCredential" entry must be signed (missing "proof").');
      }
    }
  }

  if (mode === 'sign' && presentation.proof) {
    throw new Error('"proof" property is already there.');
  }
  if (
    mode === 'verify' &&
    presentation.proof &&
    jsonld.getValues(presentation, 'proof').length > 1
  ) {
    throw new Error('"proof" property can only have one value.');
  }
};

/**
 * Checks if the input document is a raw (unsigned) Verifiable Presentation.
 * @param {RawVerifiablePresentation | unknown} presentation - The presentation to check.
 * @returns {boolean} True if it is a structurally valid unsigned presentation.
 */
export const isRawPresentation = (presentation: RawVerifiablePresentation | unknown): boolean => {
  try {
    _checkPresentation(presentation as VerifiablePresentation, 'sign');
  } catch {
    return false;
  }
  return typeof presentation === 'object' && !('proof' in (presentation as object));
};

/**
 * Checks if the input document is a signed Verifiable Presentation.
 * @param {SignedVerifiablePresentation | unknown} presentation - The presentation to check.
 * @returns {boolean} True if it is a structurally valid presentation carrying a proof.
 */
export const isSignedPresentation = (
  presentation: SignedVerifiablePresentation | unknown,
): presentation is SignedVerifiablePresentation => {
  try {
    _checkPresentation(presentation as VerifiablePresentation, 'verify');
  } catch {
    return false;
  }
  return typeof presentation === 'object' && 'proof' in (presentation as object);
};

/**
 * Builds an (unsigned) Verifiable Presentation envelope wrapping one or more
 * Verifiable Credentials, validating every input credential first.
 *
 * **Strict at creation** — the presentation is only produced if EVERY credential:
 * is signed, is **non-transferable** (no `TransferableRecords` status), has a valid
 * issuer signature, is temporally valid (not expired / not future-dated), and is not
 * revoked. Otherwise it throws with a clear reason and no VP is produced.
 *
 * The presentation is stamped with a **mandatory expiry**: `validFrom = now` and
 * `validUntil = now + lifetime` (v2.0), or `issuanceDate`/`expirationDate` (v1.1).
 * The lifetime is configurable and defaults to {@link DEFAULT_VP_LIFETIME_SECONDS}.
 *
 * @param {SignedVerifiableCredential | SignedVerifiableCredential[]} verifiableCredential -
 *   The credential(s) to present. Each must already be signed (and, for SD suites, derived).
 * @param {object} [options] - Options.
 * @param {string} [options.holder] - The holder DID. Defaults to the first credential's `credentialSubject.id`.
 * @param {string} [options.id] - An optional presentation id.
 * @param {string | string[]} [options.type] - Extra type(s) in addition to `VerifiablePresentation`.
 * @param {string | string[]} [options.context] - Override the `@context`.
 * @param {'v1' | 'v2'} [options.version] - VC Data Model version of the presentation
 *   ENVELOPE. Defaults to `'v2'` regardless of the embedded credentials' versions (each
 *   credential keeps its own `@context`). Set `'v1'` only if a verifier requires a v1.1 VP.
 * @param {number} [options.expiresInSeconds] - VP lifetime in seconds (from `validFrom`). Defaults to {@link DEFAULT_VP_LIFETIME_SECONDS}.
 * @param {string} [options.validFrom] - Explicit start time (ISO). Defaults to now.
 * @param {string} [options.validUntil] - Explicit expiry (ISO). Overrides `expiresInSeconds`.
 * @param {boolean} [options.fullDisclosure] - When true, any base (non-derived) SD credential
 *   is first derived revealing ALL fields, so it becomes verifiable/presentable. ⚠️ discloses
 *   every field. Without this, a base credential fails validation and no VP is produced.
 * @param {boolean} [options.checkHolderBinding] - When true, require every credential's
 *   `credentialSubject.id` to equal the holder (a data-consistency check to catch bundling a
 *   credential that isn't the holder's). This is NOT the cryptographic proof — that is
 *   enforced at verify time (signer DID == holder == subject) via verifyPresentation.
 * @param {Date} [options.now] - Reference time (for testing). Defaults to `new Date()`.
 * @param {DocumentLoader} [options.documentLoader] - Loader used to verify signatures/revocation.
 * @returns {Promise<RawVerifiablePresentation>} The validated, expiry-stamped presentation.
 * @throws {Error} If any credential is invalid (with the reason and its index).
 */
export const createPresentation = async (
  verifiableCredential: SignedVerifiableCredential | SignedVerifiableCredential[],
  options?: {
    holder?: string;
    id?: string;
    type?: string | string[];
    context?: string | string[];
    version?: 'v1' | 'v2';
    expiresInSeconds?: number;
    validFrom?: string;
    validUntil?: string;
    fullDisclosure?: boolean;
    checkHolderBinding?: boolean;
    now?: Date;
    documentLoader?: DocumentLoader;
  },
): Promise<RawVerifiablePresentation> => {
  let credentials = Array.isArray(verifiableCredential)
    ? verifiableCredential
    : [verifiableCredential];

  if (credentials.length === 0) {
    throw new Error('"verifiableCredential" must contain at least one credential.');
  }
  for (const credential of credentials) {
    if (!credential || typeof credential !== 'object' || !credential.proof) {
      throw new Error('each credential must be a signed credential object (with a "proof").');
    }
  }

  const now = options?.now ?? new Date();
  const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

  // Optionally auto-derive any base (non-derived) SD credential with full disclosure so it
  // becomes verifiable. Done before the checks below (a derived cred that still carries a
  // TransferableRecords status is then caught).
  if (options?.fullDisclosure) {
    credentials = await Promise.all(
      credentials.map(async (credential) =>
        (await isBaseSdCredential(credential))
          ? await deriveFullDisclosure(credential, documentLoader)
          : credential,
      ),
    );
  }

  // Transferable records are controlled on-chain and must not be presented via a VP.
  assertNoTransferableRecords(credentials);

  // Strict validation: every credential must be genuine, temporally valid, and unrevoked.
  for (let i = 0; i < credentials.length; i++) {
    const verification = await verifyCredential(credentials[i], { documentLoader });
    if (!verification.verified) {
      throw new Error(`credential at index ${i} is not valid: ${verification.error}`);
    }
    assertCredentialTemporallyValid(credentials[i], i, now);
    await assertCredentialNotRevoked(credentials[i], i, documentLoader);
  }

  // The presentation ENVELOPE defaults to VC Data Model v2.0, independent of the embedded
  // credentials' versions (each credential keeps its own @context). Override with `version`.
  const isV2 = options?.version !== 'v1';
  const modelContext = isV2 ? VC_V2_URL : VC_V1_URL;

  // Base context + an inline definition of the expiry terms so the stamped
  // validFrom/validUntil (or issuanceDate/expirationDate) survive strict JSON-LD safe mode.
  const baseContext = options?.context ?? [modelContext, DATA_INTEGRITY_V2_URL];
  const context = [
    ...(Array.isArray(baseContext) ? baseContext : [baseContext]),
    VP_EXPIRY_CONTEXT,
  ];

  const extraTypes = options?.type
    ? Array.isArray(options.type)
      ? options.type
      : [options.type]
    : [];
  const type = [
    'VerifiablePresentation',
    ...extraTypes.filter((t) => t !== 'VerifiablePresentation'),
  ];

  // Default the holder to the subject of the first credential, when present.
  const holder = options?.holder ?? readId(getFirstSubject(credentials[0]));

  // Optional holder-binding CONSISTENCY check (data-level, not cryptographic): every
  // credential must be about the holder. Catches bundling a credential that isn't the
  // holder's, or mixing credentials from different subjects. The cryptographic proof
  // (signer DID == holder == subject) is enforced later by verifyPresentation.
  if (options?.checkHolderBinding) {
    if (!holder) {
      throw new Error(
        'holder binding requested but no "holder" is set and no credentialSubject.id to derive it from.',
      );
    }
    for (let i = 0; i < credentials.length; i++) {
      const subjectId = readId(getFirstSubject(credentials[i]));
      if (!subjectId) {
        throw new Error(
          `credential at index ${i} has no "credentialSubject.id", so it cannot be bound to the holder.`,
        );
      }
      if (subjectId !== holder) {
        throw new Error(
          `credential at index ${i} is about "${subjectId}", which does not match the holder ` +
            `"${holder}".`,
        );
      }
    }
  }

  // Mandatory expiry stamp. Validate any caller-supplied bounds so a malformed date
  // cannot throw a raw RangeError and a born-expired VP is rejected up front.
  const validFrom = options?.validFrom ?? now.toISOString();
  if (Number.isNaN(new Date(validFrom).getTime())) {
    throw new Error(`"validFrom" is not a valid ISO date-time: "${validFrom}".`);
  }
  const validUntil =
    options?.validUntil ??
    new Date(
      new Date(validFrom).getTime() +
        (options?.expiresInSeconds ?? DEFAULT_VP_LIFETIME_SECONDS) * 1000,
    ).toISOString();
  if (
    Number.isNaN(new Date(validUntil).getTime()) ||
    new Date(validUntil).getTime() <= new Date(validFrom).getTime()
  ) {
    throw new Error(
      `"validUntil" (${validUntil}) must be a valid time after "validFrom" (${validFrom}).`,
    );
  }

  const presentation: RawVerifiablePresentation = {
    '@context': context,
    type,
    verifiableCredential: credentials,
  };
  if (options?.id) {
    presentation.id = options.id;
  }
  if (holder) {
    presentation.holder = holder;
  }
  // v2.0 uses validFrom/validUntil; v1.1 uses issuanceDate/expirationDate.
  if (isV2) {
    presentation.validFrom = validFrom;
    presentation.validUntil = validUntil;
  } else {
    presentation.issuanceDate = validFrom;
    presentation.expirationDate = validUntil;
  }
  return presentation;
};

/**
 * Signs a Verifiable Presentation with a holder-binding proof.
 *
 * The proof uses the plain (non-selective-disclosure) `ecdsa-rdfc-2019`
 * cryptosuite, signing the whole envelope. It reuses the same ECDSA (P-256)
 * Multikey used for `ecdsa-sd-2023` credentials — the holder's signing key is
 * independent of the cryptosuites used by the embedded credentials, which may be
 * anything (`ecdsa-sd-2023`, `bbs-2023`, ...).
 *
 * The selective-disclosure suites (`ecdsa-sd-2023`, `bbs-2023`) and the
 * deprecated `BbsBlsSignature2020` are rejected for the presentation proof.
 *
 * The proof purpose depends on whether a `challenge` is supplied:
 * - **with `challenge`** → `proofPurpose: authentication` (holder authenticating for a
 *   specific request; carries `challenge` and optional `domain`; enables replay/relay
 *   protection when the verifier checks them).
 * - **without `challenge`** → `proofPurpose: assertionMethod` (the holder asserts the
 *   bundle; NO `challenge`/`domain` fields). This proves the holder's key signed the VP
 *   and its integrity, but is NOT anti-replay — a captured VP can be re-presented.
 *
 * @param {RawVerifiablePresentation} presentation - The unsigned presentation.
 * @param {PrivateKeyPair} keyPair - The holder's ECDSA (P-256) Multikey key pair.
 * @param {object} [options] - Signing options.
 * @param {string} [options.challenge] - Verifier-supplied challenge. When present, an
 *   `authentication` proof is produced (prevents replay); when omitted, an
 *   `assertionMethod` proof with no challenge/domain is produced.
 * @param {string} [options.domain] - Verifier domain. Requires `challenge` (audience
 *   binding only applies to an authentication proof).
 * @param {DocumentLoader} [options.documentLoader] - Custom JSON-LD document loader.
 * @param {PresentationProofSuite} [options.cryptoSuite] - Presentation proof suite. Defaults to 'ecdsa-rdfc-2019'.
 * @param {boolean} [options.checkHolderBinding] - When true, refuse to sign unless the
 *   signing key's DID matches the presentation's `holder` and every `credentialSubject.id`.
 *   Catches signing with the wrong key at sign time (otherwise only caught by the verifier).
 * @returns {Promise<PresentationSigningResult>} The signed presentation or an error.
 */
export const signPresentation = async (
  presentation: RawVerifiablePresentation,
  keyPair: PrivateKeyPair,
  options?: {
    challenge?: string;
    domain?: string;
    documentLoader?: DocumentLoader;
    cryptoSuite?: PresentationProofSuite;
    checkHolderBinding?: boolean;
  },
): Promise<PresentationSigningResult> => {
  try {
    const cryptoSuite = options?.cryptoSuite ?? PRESENTATION_PROOF_CRYPTOSUITE;

    if (UNSUPPORTED_PROOF_SUITES.has(cryptoSuite)) {
      return {
        error:
          `"${cryptoSuite}" cannot sign a Verifiable Presentation. Selective-disclosure ` +
          `suites cannot cover the "verifiableCredential" @graph, and BbsBlsSignature2020 is ` +
          `deprecated. Use "${PRESENTATION_PROOF_CRYPTOSUITE}"; embedded credentials may still ` +
          `use any suite.`,
      };
    }
    if (cryptoSuite !== PRESENTATION_PROOF_CRYPTOSUITE) {
      return { error: `"${cryptoSuite}" is not supported for signing a presentation.` };
    }

    // A `challenge` yields an authentication proof; omitting it yields an assertion
    // proof (no challenge/domain). `domain` only makes sense with a challenge.
    const challenge = options?.challenge;
    if (options?.domain && !challenge) {
      return {
        error: '"domain" requires a "challenge" (audience binding needs an authentication proof).',
      };
    }

    if (!keyPair) {
      return { error: 'a signing key (keyPair) is required to sign a presentation.' };
    }
    _checkPresentation(presentation, 'sign');
    _checkKeyPair(keyPair);

    const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

    // Transferable records are controlled on-chain and must not be presented via a VP.
    assertNoTransferableRecords(getCredentials(presentation));

    // Optionally refuse to sign with the wrong key: the signing key's DID must match the
    // holder and every credentialSubject.id. Caught here at sign time (a verifier with
    // checkHolderBinding would otherwise catch it later).
    if (options?.checkHolderBinding) {
      const signerDid = keyPair.controller ?? getDidFromId(keyPair.id);
      const holder = readId(presentation.holder);
      // A missing DID must FAIL, not silently pass — otherwise the opt-in check no-ops
      // in exactly the unbound case it exists to catch (mirrors createPresentation and
      // verifyPresentation, which both hard-fail here).
      if (!signerDid) {
        return {
          error: 'holder binding requires a signing key with a resolvable DID (controller/id).',
        };
      }
      if (holder && holder !== signerDid) {
        return {
          error: `the signing key "${signerDid}" does not match the presentation holder "${holder}".`,
        };
      }
      const owner = holder ?? signerDid;
      const credentials = getCredentials(presentation);
      for (let i = 0; i < credentials.length; i++) {
        const subjectId = readId(getFirstSubject(credentials[i]));
        if (!subjectId) {
          return {
            error: `credential at index ${i} has no "credentialSubject.id", so it cannot be bound to the holder.`,
          };
        }
        if (subjectId !== owner) {
          return {
            error:
              `credential at index ${i} is about "${subjectId}", which does not match the ` +
              `signing key / holder "${owner}".`,
          };
        }
      }
    }

    // Load the ECDSA Multikey into a signer. A non-ECDSA key (e.g. a BBS Multikey)
    // fails here — surface a clear, actionable error rather than the raw failure.
    let signer;
    try {
      const ecdsaKeyPair = keyPair as EcdsaSd2023PrivateKeyPair;
      const keyPairInstance = await EcdsaMultikey.from({ ...ecdsaKeyPair });
      signer = keyPairInstance.signer();
    } catch {
      return {
        error:
          `An ECDSA (P-256) Multikey is required to sign a presentation with ` +
          `"${PRESENTATION_PROOF_CRYPTOSUITE}". The provided key could not be loaded as an ECDSA key ` +
          `(BBS keys cannot produce a plain presentation proof).`,
      };
    }

    // authentication (with challenge) vs assertionMethod (no challenge/domain)
    const purpose = challenge
      ? new AuthenticationProofPurpose({ challenge, domain: options?.domain })
      : new AssertionProofPurpose();

    const signed = await jsonldSignatures.sign(presentation, {
      suite: new DataIntegrityProof({
        signer,
        cryptosuite: ecdsaRdfc2019Cryptosuite.cryptosuite,
      }),
      purpose,
      documentLoader,
    });

    return { signed: signed as SignedVerifiablePresentation };
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return { error: 'An error occurred while signing the presentation.' };
    }
    return { error: err.message };
  }
};

type HolderProofResult = PresentationVerificationResult['presentationResult'];

/**
 * Stage 0 — temporal validity of the presentation envelope itself: reject an expired
 * or not-yet-valid VP, and (when `maxLifetimeSeconds` is set) one whose own lifetime
 * exceeds the cap so a far-future `validUntil` can't defeat the expiry.
 * @returns {string | undefined} An error message, or undefined when temporally valid.
 */
const checkVpTemporalValidity = (
  presentation: VerifiablePresentation,
  vpNow: Date,
  maxLifetimeSeconds?: number,
): string | undefined => {
  const { from, until } = getValidityBounds(presentation);
  if (until && vpNow > new Date(until)) {
    return `presentation has expired (validUntil ${until}).`;
  }
  if (from && vpNow < new Date(from)) {
    return `presentation is not yet valid (validFrom ${from}).`;
  }
  if (maxLifetimeSeconds != null && from && until) {
    const lifetimeSeconds = (new Date(until).getTime() - new Date(from).getTime()) / 1000;
    if (lifetimeSeconds > maxLifetimeSeconds) {
      return (
        `presentation lifetime (${lifetimeSeconds}s) exceeds the maximum allowed ` +
        `(${maxLifetimeSeconds}s).`
      );
    }
  }
  return undefined;
};

/**
 * Stage 1 — verify each embedded credential independently (any suite / version).
 * Expiry and revocation are enforced here too (verifyCredential only checks the
 * signature) so a VP is rejected for an expired or revoked embedded credential —
 * consistent with createPresentation's strict creation.
 */
const verifyEmbeddedCredentials = async (
  credentials: SignedVerifiableCredential[],
  vpNow: Date,
  documentLoader: DocumentLoader,
): Promise<CredentialVerificationResult[]> => {
  const credentialResults: CredentialVerificationResult[] = [];
  for (let i = 0; i < credentials.length; i++) {
    let result = await verifyCredential(credentials[i], { documentLoader });
    if (result.verified) {
      try {
        assertCredentialTemporallyValid(credentials[i], i, vpNow);
        await assertCredentialNotRevoked(credentials[i], i, documentLoader);
      } catch (err) {
        result = {
          verified: false,
          error: err instanceof Error ? err.message : 'credential is no longer valid',
        };
      }
    }
    credentialResults.push({ ...result, credentialIndex: i });
  }
  return credentialResults;
};

/**
 * Stage 2 — verify the holder-binding proof, if present. Only `ecdsa-rdfc-2019`
 * DataIntegrityProofs are supported. An `authentication` proof requires a
 * caller-supplied challenge (the proof's own challenge is never trusted); an
 * `assertionMethod` proof takes no challenge/domain.
 * @returns {HolderProofResult} The proof result, or undefined when the VP is unsigned.
 */
const verifyHolderProof = async (
  presentation: VerifiablePresentation,
  options: { challenge?: string; domain?: string } | undefined,
  documentLoader: DocumentLoader,
): Promise<HolderProofResult> => {
  if (!presentation.proof) {
    return undefined;
  }
  const proof = jsonld.getValues(presentation, 'proof')[0];
  const proofType = proof.type as ProofType;
  const proofCryptosuite = proof.cryptosuite as string | undefined;
  if (proofType !== 'DataIntegrityProof' || proofCryptosuite !== PRESENTATION_PROOF_CRYPTOSUITE) {
    return {
      verified: false,
      error:
        `Presentation proof type "${proofType}"` +
        (proofCryptosuite ? ` (cryptosuite "${proofCryptosuite}")` : '') +
        ` is not supported. Only "${PRESENTATION_PROOF_CRYPTOSUITE}" holder proofs are supported.`,
    };
  }

  const runVerify = async (purpose: unknown) =>
    jsonldSignatures.verify(presentation, {
      suite: new DataIntegrityProof({ cryptosuite: ecdsaRdfc2019Cryptosuite.cryptosuite }),
      purpose,
      documentLoader,
    });
  const toResult = (result: { verified: boolean; error?: { errors?: { message?: string }[] } }) =>
    result.verified
      ? { verified: true }
      : {
          verified: false,
          error: result.error?.errors?.[0]?.message ?? 'Presentation proof verification error.',
        };

  const proofPurpose = proof.proofPurpose as string | undefined;
  if (proofPurpose === 'authentication') {
    // The challenge MUST be supplied by the caller (the verifier), not read from the
    // proof — trusting the proof's own challenge would defeat replay protection.
    const challenge = options?.challenge;
    if (!challenge) {
      return {
        verified: false,
        error:
          'A caller-supplied "challenge" is required to verify an authentication ' +
          'presentation proof. Pass the challenge the verifier issued; the value embedded ' +
          'in the proof is not trusted.',
      };
    }
    return toResult(
      await runVerify(new AuthenticationProofPurpose({ challenge, domain: options?.domain })),
    );
  }
  if (proofPurpose === 'assertionMethod') {
    // Assertion proof: no challenge/domain. Proves the holder's key signed the VP
    // (integrity + control at signing time) but is NOT anti-replay.
    return toResult(await runVerify(new AssertionProofPurpose()));
  }
  return {
    verified: false,
    error: `Presentation proof purpose "${proofPurpose}" is not supported.`,
  };
};

/**
 * Stage 3 — optional holder binding: cryptographically prove the presenter owns the
 * credentials. Requires a VALID holder proof AND signerDid === holder === every
 * credentialSubject.id. Without a proof, ownership cannot be established.
 * @returns {string | undefined} An error message, or undefined when binding holds.
 */
const checkHolderBindingAtVerify = (
  presentation: VerifiablePresentation,
  credentials: SignedVerifiableCredential[],
  presentationResult: HolderProofResult,
): string | undefined => {
  if (!presentation.proof) {
    return (
      'holder binding requires a signed presentation (no "proof" is present, so ownership ' +
      'cannot be proven).'
    );
  }
  if (presentationResult?.verified !== true) {
    return 'holder binding requires a valid presentation proof, but the proof did not verify.';
  }
  // The DID that signed the presentation (verificationMethod without its fragment).
  const signerDid = getDidFromId(presentation.proof.verificationMethod as string | undefined);
  const holder = readId(presentation.holder);
  if (!signerDid) {
    return 'the presentation proof has no "verificationMethod" to bind to.';
  }
  if (holder && holder !== signerDid) {
    return (
      `the presentation was signed by "${signerDid}", which does not match the ` +
      `declared holder "${holder}".`
    );
  }
  // Every credential must be about the presenter (the signer / holder).
  const owner = holder ?? signerDid;
  for (let i = 0; i < credentials.length; i++) {
    const subjectId = readId(getFirstSubject(credentials[i]));
    if (!subjectId) {
      return (
        `credential at index ${i} has no "credentialSubject.id", so it cannot be bound ` +
        `to the holder.`
      );
    }
    if (subjectId !== owner) {
      return (
        `credentialSubject.id ("${subjectId}") of credential at index ${i} does not ` +
        `match the presentation holder/signer ("${owner}").`
      );
    }
  }
  return undefined;
};

/**
 * Verifies a Verifiable Presentation.
 *
 * Verification succeeds only when every embedded credential verifies AND, if the
 * presentation carries a holder proof, that proof verifies too. Each embedded
 * credential is verified independently via {@link verifyCredential}, so a single
 * presentation may mix cryptosuites and VC data-model versions.
 *
 * @param {VerifiablePresentation} presentation - The presentation to verify.
 * @param {object} [options] - Verification options.
 * @param {string} [options.challenge] - The challenge the verifier issued. REQUIRED
 *   when the presentation carries an `authentication` proof — verification fails without
 *   it. Not needed for an `assertionMethod` proof (which has no challenge). The proof's
 *   own embedded challenge is never trusted (that would allow replay).
 * @param {string} [options.domain] - Expected domain, checked against the proof.
 * @param {boolean} [options.requireProof] - When true, a presentation WITHOUT a
 *   holder proof fails verification. Set this when the verifier needs holder
 *   binding, so an unsigned bundle is not silently accepted. Default false
 *   (unsigned presentations verify on credential authenticity alone).
 * @param {boolean} [options.checkHolderBinding] - When true, cryptographically
 *   require that the presenter owns the credentials: the presentation must be
 *   signed, and the signing key's DID must equal the holder and every credential's
 *   `credentialSubject.id`. Fails on an unsigned presentation (ownership cannot be
 *   proven without a signature).
 * @param {number} [options.maxLifetimeSeconds] - When set, reject a presentation whose
 *   own lifetime (validUntil − validFrom) exceeds this — so a holder can't defeat the
 *   expiry with a far-future `validUntil`. (Expiry itself is always checked.)
 * @param {Date} [options.now] - Reference time for expiry checks (for testing). Defaults to now.
 * @param {DocumentLoader} [options.documentLoader] - Custom JSON-LD document loader.
 * @returns {Promise<PresentationVerificationResult>} The aggregated verification result.
 */
export const verifyPresentation = async (
  presentation: VerifiablePresentation,
  options?: {
    challenge?: string;
    domain?: string;
    requireProof?: boolean;
    checkHolderBinding?: boolean;
    maxLifetimeSeconds?: number;
    now?: Date;
    documentLoader?: DocumentLoader;
  },
): Promise<PresentationVerificationResult> => {
  try {
    _checkPresentation(presentation, 'verify');
    const documentLoader = options?.documentLoader ?? (await getDocumentLoader());

    const vpNow = options?.now ?? new Date();
    const credentials = getCredentials(presentation);

    // The four verification stages (each extracted into a focused helper).
    const expiryError = checkVpTemporalValidity(presentation, vpNow, options?.maxLifetimeSeconds);
    const credentialResults = await verifyEmbeddedCredentials(credentials, vpNow, documentLoader);
    const presentationResult = await verifyHolderProof(presentation, options, documentLoader);
    const holderBindingError = options?.checkHolderBinding
      ? checkHolderBindingAtVerify(presentation, credentials, presentationResult)
      : undefined;

    const allCredentialsVerified =
      credentials.length > 0 && credentialResults.every((r) => r.verified);

    // A verifier that needs holder binding can require a proof to be present.
    const missingRequiredProof = options?.requireProof && !presentation.proof;

    const proofVerified = presentation.proof ? presentationResult?.verified === true : true;
    const verified =
      allCredentialsVerified &&
      proofVerified &&
      !holderBindingError &&
      !missingRequiredProof &&
      !expiryError;

    const aggregate: PresentationVerificationResult = {
      verified,
      credentialResults,
    };
    if (presentationResult) {
      aggregate.presentationResult = presentationResult;
    }
    if (!verified) {
      // First applicable message wins, in priority order (avoids nested ternaries).
      const requiredProofError = missingRequiredProof
        ? 'a holder proof is required ("requireProof"), but the presentation is not signed.'
        : undefined;
      const noCredentialsError =
        credentials.length === 0 ? 'presentation contains no verifiable credentials.' : undefined;
      aggregate.error =
        [
          expiryError,
          requiredProofError,
          holderBindingError,
          presentationResult?.error,
          credentialResults.find((r) => !r.verified)?.error,
          noCredentialsError,
        ].find((message) => message !== undefined) ?? 'presentation verification failed.';
    }
    return aggregate;
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      return { verified: false, error: 'An error occurred while verifying the presentation.' };
    }
    return { verified: false, error: err.message };
  }
};
