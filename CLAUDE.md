# CLAUDE.md

Guidance for working in this repo — for human developers and for Claude Code.

> **Keep this file alive.** This document is only useful if it stays true. Treat it
> as part of the code: whenever a change makes something here wrong or incomplete,
> update it *in the same commit/PR*. See [Maintaining this file](#maintaining-this-file).

## What this repo is

`@trustvc/w3c` is an **nx-managed npm-workspaces monorepo** for W3C Verifiable
Credentials / Verifiable Presentations. Packages live under `packages/*`, apps
under `apps/*`. Each package is published independently to npm (semantic-release).

| Package | Responsibility |
| --- | --- |
| `@trustvc/w3c-vc` | Sign / verify **credentials** and **presentations** (the crypto core). |
| `@trustvc/w3c-issuer` | Key generation, did:key / did:web issuer material, `VerificationType`. |
| `@trustvc/w3c-context` | JSON-LD contexts + the shared **document loader** (resolves did:web, did:key, hosted contexts). |
| `@trustvc/w3c-credential-status` | Credential status (incl. on-chain `TransferableRecords`). |
| `@trustvc/w3c` | Umbrella package re-exporting the above. |

Consumers (e.g. `@trustvc/trustvc`) depend on the **published** packages, so treat
every public export as an API surface — see "Publishing / testing changes" below.

## Commands

Node **≥ 18.17** (root engines). nx caches aggressively.

```bash
# From repo root (runs across all packages):
npm run build          # nx run-many --target=build (tsup per package)
npm test               # nx run-many --target=test  (vitest)
npm run lint           # tsc --noEmit + eslint, --max-warnings=0
npm run test:skip-cache  # bypass the nx cache when results look stale

# Single package (faster loop) — cd into it, or use nx:
cd packages/w3c-vc
npm test                                  # vitest --run --test-timeout=15000
npx vitest --run src/lib/presentation/index.test.ts   # one file
npx vitest --run <file> -t "did:web"      # one test by name
npm run lint                              # tsc --noEmit && eslint (must be 0 warnings)
npm run build                             # clean + tsup
```

**`lint` = typecheck + eslint.** CI fails on any eslint warning (`--max-warnings=0`)
and on any tsc error. Run it before considering a change done.

Some tests hit the network (did:web resolution against `trustvc.github.io`). They
are real integration checks, not mocks — don't stub them away.

## ⚠️ The jsonld override gotcha (read this before touching JSON-LD)

The repo root `package.json` pins:

```json
"overrides": { "jsonld": "^6.0.0" }
```

This forces **jsonld 6** everywhere in the monorepo, but real consumers may resolve
**jsonld 9**, which has a **much stricter safe mode**. A document that expands fine
here can throw *"Safe mode validation error … did not expand into an absolute IRI"*
in a downstream repo. **Passing tests here do not prove JSON-LD correctness.**

Concretely: this bit us on VPs — `validFrom` / `validUntil` are only defined in the
type-scoped context of `VerifiableCredential`, not `VerifiablePresentation`. jsonld 6
let it slide; jsonld 9 rejected it. The fix lives in
[packages/w3c-vc/src/lib/presentation/index.ts](packages/w3c-vc/src/lib/presentation/index.ts)
as `VP_EXPIRY_CONTEXT` — an inline `@context` mapping those terms to canonical
`https://www.w3.org/2018/credentials#` IRIs with `xsd:dateTime`.

**Rule:** if you add or move any term onto a VC/VP envelope, verify it expands to an
absolute IRI under jsonld's safe mode. When in doubt, test in a repo that resolves
jsonld 9 (see below) — not just here.

## Verifiable Presentations (`src/lib/presentation`)

VP support was designed around a few hard rules. Preserve them:

1. **`ecdsa-rdfc-2019` is the only VP holder-proof suite.** Selective-disclosure
   suites (`ecdsa-sd-2023`, `bbs-2023`) and the deprecated `BbsBlsSignature2020`
   **cannot sign a VP**: `verifiableCredential` is a JSON-LD `@graph`, which is not
   JSON-pointer-addressable, so SD canonicalization fails. The holder signs the VP
   envelope with the **same ECDSA P-256 Multikey** used for credentials — no new key
   type needed. (Embedded credentials keep whatever suite they were issued with;
   a VP freely mixes suites and VC data-model versions.)

2. **Never allow a VP over a credential with `TransferableRecords` status.** That
   status is controlled on-chain; presenting it off-chain is meaningless/misleading.
   Enforced by `assertNoTransferableRecords` in both create and sign.

3. **Create and verify must agree.** If `createPresentation` rejects something
   (expired embedded credential, revoked credential, subject/holder mismatch under
   `checkHolderBinding`), `verifyPresentation` must reject it too. We fixed an
   asymmetry where verify accepted expired embedded VCs that create rejected — keep
   them symmetric when you add checks.

4. **Holder binding is a string-equality check across DIDs:**
   `signingKey.controller === holder === every credentialSubject.id`. It is
   **method-agnostic** — `did:key` and `did:web` both work. did:web only additionally
   requires that its DID document be web-resolvable and publish the ECDSA Multikey
   (the shared document loader handles resolution).

5. **`challenge` is never trusted from the proof at verify time** — the caller (the
   verifier) must supply it. `challenge` → `authentication` proof (anti-replay);
   no challenge → `assertionMethod` proof. `domain` requires a `challenge`.

The public API from `@trustvc/w3c-vc`: `createPresentation`, `signPresentation`,
`verifyPresentation`, `isRawPresentation`, `isSignedPresentation` (+ the VP types in
`src/lib/types.ts`). Note the **trustvc layer wraps these into an opinionated
`signW3CPresentation` / `verifyW3CPresentation`** that *enforces* fullDisclosure,
holder binding, and a mandatory lifetime — that policy lives in the consumer, not here.

## Credentials (`src/lib/w3c-vc.ts`)

`signCredential` / `verifyCredential` / `deriveCredential` / `isDerived`. Selective
disclosure = a **base** credential (full, signed with `ecdsa-sd-2023` / `bbs-2023`)
→ `deriveCredential(base, ['/json/pointer', ...])` → a **derived** credential
revealing only those fields. A VP should carry derived (or non-SD) credentials.

Note: standalone `verifyCredential` currently only **warns** on expiry (does not
fail). The VP flow is stricter and *fails* on expired embedded credentials. If you
change one, consider whether the other should follow.

## Adding a dependency on a `@digitalbazaar/*` (or similar) package

Many crypto packages ship **no types**. Add a `declare module '...';` line to
[packages/declaration.d.ts](packages/declaration.d.ts) or tsc will fail.

## Publishing / testing changes before release

Because downstream consumers resolve **jsonld 9** and their own dep tree, validate
real changes outside this monorepo before publishing:

```bash
# 1. build + pack the changed package
cd packages/w3c-vc && npm run build && npm pack   # → trustvc-w3c-vc-x.y.z.tgz
# 2. install the tarball into the consumer (e.g. ../trustvc-7) and run ITS tests
#    (that repo needs Node ≥ 20; use `nvm use 20`)
```

This pre-publish loop is what caught the jsonld-9 `validFrom` bug. Do it for any
change that touches JSON-LD, contexts, or public exports.

## Conventions

- **TypeScript, no `!` non-null assertions** in tests — use an `assertDefined` helper
  (see the existing test files). Avoid `any`; prefer `as never` at test boundaries
  when a fixture is intentionally loosely typed.
- **Fixtures** live in `src/lib/__fixtures__/`. The did:web and did:key key pairs in
  `key-pairs.ts` share the same underlying key material — reuse them, don't invent
  new keys.
- Match the surrounding file's style; keep comments explaining *why* (the rules
  above are subtle and easy to regress).
- Conventional commits (commitlint + semantic-release drive versioning/changelogs).

## Maintaining this file

**This file is documentation-as-code. Keep it in sync with the repo in the same
change that makes it stale — not "later".**

Update `CLAUDE.md` when your change touches any of:

- **A public export or its behavior** — a new/renamed/removed function, a changed
  signature, a new package. Update the package table and the relevant section.
- **A rule or invariant** — anything in the VP "hard rules" list, holder binding,
  the `TransferableRecords` block, create/verify symmetry, the supported cryptosuite
  set. If you intentionally change one, change its description here and say why.
- **Commands, scripts, tooling, or Node/engine requirements** — keep the Commands
  section runnable exactly as written.
- **A gotcha you just spent time on.** If something surprised you or cost you an
  hour (a jsonld safe-mode quirk, an nx cache stale-result, a missing `declare
  module`, a network-dependent test), add or expand a note so the next person —
  human or Claude — doesn't repeat it. New gotchas are the highest-value additions.

Guidelines:

- **Small and true beats big and stale.** Delete guidance that no longer holds
  rather than leaving it to mislead. Wrong docs are worse than none.
- Keep it **repo-specific and actionable** — decisions, rules, and gotchas that
  aren't obvious from the code or git history. Don't restate what a reader can see
  by opening the file.
- Prefer linking to the source of truth (a file/line) over duplicating detail that
  will drift.
- When editing a rule, keep the *why* — these invariants are load-bearing and easy
  to "simplify" back into a bug.

**For Claude Code specifically:** at the end of a task that changed any of the above,
check whether this file is now inaccurate and propose the edit as part of the same
work — don't wait to be asked.
