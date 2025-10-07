import { describe, expect, it } from 'vitest';
import { deriveCredential, signCredential, verifyCredential } from './w3c-vc';
import {
  modernCryptosuiteTestScenarios,
  bbs2020TestScenarios,
} from './__fixtures__/test-scenarios';

/**
 * W3C Verifiable Credentials Test Suite
 *
 * This test suite covers:
 * - Modern cryptosuites: ECDSA-SD-2023 and BBS-2023 (full functionality)
 * - Legacy BBS2020 cryptosuite (deprecation + verification)
 */
describe('W3C Verifiable Credentials', () => {
  describe('Legacy BBS2020 Cryptosuite', () => {
    describe.each(bbs2020TestScenarios)(
      'BBS2020 $version Operations (Deprecated)',
      ({ cryptosuite, keyPair, credential, derivedCredential }) => {
        it('should return deprecation error when signing', async () => {
          // Remove proof to get unsigned credential
          const { proof: _proof, ...testCredential } = credential;

          // BBS2020 signing should return deprecation error
          const signedCredential = await signCredential(testCredential, keyPair, cryptosuite);
          expect(signedCredential.signed).toBeUndefined();
          expect(signedCredential.error).toBe(
            'BbsBlsSignature2020 is no longer supported. Please use the latest cryptosuite versions instead.',
          );
        });

        it('should return deprecation error when deriving', async () => {
          // BBS2020 derivation should return deprecation error
          const revealDocument: any = {
            '@context': credential['@context'],
            credentialSubject: {
              type: ['BillOfLading'],
              '@explicit': true,
              billOfLadingName: {},
              blNumber: {},
            },
            type: ['VerifiableCredential'],
          };

          const derivedResult = await deriveCredential(credential, revealDocument);
          expect(derivedResult.derived).toBeUndefined();
          expect(derivedResult.error).toBe(
            'BbsBlsSignature2020 is no longer supported for derivation. Please use the latest cryptosuite versions instead.',
          );
        });

        it('should still verify existing credentials (backward compatibility)', async () => {
          // Should still be able to verify existing BBS2020 credentials
          const baseVerificationResult = await verifyCredential(credential);
          expect(baseVerificationResult.verified).toBe(true);
          expect(baseVerificationResult.error).toBeUndefined();

          const derivedVerificationResult = await verifyCredential(derivedCredential);
          expect(derivedVerificationResult.verified).toBe(true);
          expect(derivedVerificationResult.error).toBeUndefined();
        });

        it('should detect tampered credentials (comprehensive security)', async () => {
          // Test tampering with base credential - modify credentialSubject
          const tamperedBaseCredential = {
            ...credential,
            credentialSubject: {
              ...credential.credentialSubject,
              billOfLadingName: 'TAMPERED Bill of Lading',
            },
          };

          const baseVerificationResult = await verifyCredential(tamperedBaseCredential);
          expect(baseVerificationResult.verified).toBe(false);
          expect(baseVerificationResult.error).toBeDefined();

          // Test tampering with base credential proof value
          const tamperedProofCredential = {
            ...credential,
            proof: {
              ...credential.proof,
              proofValue: credential.proof.proofValue.replace(/A/g, 'B'),
            },
          };

          const proofVerificationResult = await verifyCredential(tamperedProofCredential);
          expect(proofVerificationResult.verified).toBe(false);
          expect(proofVerificationResult.error).toBeDefined();

          // Test tampering with derived credential - modify credentialSubject
          const tamperedDerivedCredential = {
            ...derivedCredential,
            credentialSubject: {
              ...derivedCredential.credentialSubject,
              billOfLadingName: 'TAMPERED Derived Bill of Lading',
            },
          };

          const derivedVerificationResult = await verifyCredential(tamperedDerivedCredential);
          expect(derivedVerificationResult.verified).toBe(false);
          expect(derivedVerificationResult.error).toBeDefined();

          // Test tampering with derived credential proof value
          const tamperedDerivedProofCredential = {
            ...derivedCredential,
            proof: {
              ...derivedCredential.proof,
              proofValue: derivedCredential.proof.proofValue.replace(/A/g, 'B'),
            },
          };

          const derivedProofVerificationResult = await verifyCredential(
            tamperedDerivedProofCredential,
          );
          expect(derivedProofVerificationResult.verified).toBe(false);
          expect(derivedProofVerificationResult.error).toBeDefined();
        });
      },
    );
  });

  describe('Modern Cryptosuites (ECDSA-SD-2023 & BBS-2023)', () => {
    describe.each(modernCryptosuiteTestScenarios)(
      '$cryptosuite $version Credential Operations',
      ({ cryptosuite, keyPair, credential, dateField, dateValue }) => {
        it('should successfully sign, derive, and verify credentials', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          // Sign the credential
          const signedCredential = await signCredential(testCredential, keyPair, cryptosuite);
          expect(signedCredential.signed).toBeDefined();
          expect(signedCredential.error).toBeUndefined();
          expect(signedCredential.signed?.proof?.type).toBe('DataIntegrityProof');

          // Derive the credential with selective disclosure
          const selectivePointers = ['/credentialSubject/billOfLadingName'];
          const derivedCredential = await deriveCredential(
            signedCredential.signed,
            selectivePointers,
          );
          expect(derivedCredential.derived).toBeDefined();
          expect(derivedCredential.error).toBeUndefined();

          // Verify core mandatory pointers are included
          expect(derivedCredential.derived?.issuer).toBeDefined();
          expect(derivedCredential.derived?.[dateField]).toBeDefined();

          // Verify selective disclosure works
          const credentialSubject = Array.isArray(derivedCredential.derived?.credentialSubject)
            ? derivedCredential.derived?.credentialSubject[0]
            : derivedCredential.derived?.credentialSubject;
          expect(credentialSubject?.billOfLadingName).toBeDefined();
          expect(credentialSubject?.blNumber).toBeUndefined();

          // Verify the derived credential
          const verificationResult = await verifyCredential(derivedCredential.derived);
          expect(verificationResult.verified).toBe(true);
          expect(verificationResult.error).toBeUndefined();
        });

        it('should support custom mandatory pointers with selective disclosure', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          // Sign with custom mandatory pointers
          const customMandatoryPointers = ['/credentialSubject/billOfLadingName'];
          const signedCredential = await signCredential(testCredential, keyPair, cryptosuite, {
            mandatoryPointers: customMandatoryPointers,
          });
          expect(signedCredential.signed).toBeDefined();
          expect(signedCredential.error).toBeUndefined();

          // Derive with selective disclosure
          const selectivePointers = ['/credentialSubject/blNumber'];
          const derivedCredential = await deriveCredential(
            signedCredential.signed,
            selectivePointers,
          );
          expect(derivedCredential.derived).toBeDefined();
          expect(derivedCredential.error).toBeUndefined();

          // Verify mandatory and selective pointers are included
          const credentialSubject = Array.isArray(derivedCredential.derived?.credentialSubject)
            ? derivedCredential.derived?.credentialSubject[0]
            : derivedCredential.derived?.credentialSubject;
          expect(credentialSubject?.billOfLadingName).toBeDefined(); // Mandatory
          expect(credentialSubject?.blNumber).toBeDefined(); // Selected
          expect(credentialSubject?.scac).toBeUndefined(); // Not selected

          // Verify the derived credential
          const verificationResult = await verifyCredential(derivedCredential.derived);
          expect(verificationResult.verified).toBe(true);
          expect(verificationResult.error).toBeUndefined();
        });

        it('should automatically include entire credentialSubject when no properties selected', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          // Sign the credential
          const signedCredential = await signCredential(testCredential, keyPair, cryptosuite);
          expect(signedCredential.signed).toBeDefined();

          // Derive with no credentialSubject pointers
          const selectivePointers: string[] = [];
          const derivedCredential = await deriveCredential(
            signedCredential.signed,
            selectivePointers,
          );
          expect(derivedCredential.derived).toBeDefined();

          // Verify entire credentialSubject is included
          const credentialSubject = Array.isArray(derivedCredential.derived?.credentialSubject)
            ? derivedCredential.derived?.credentialSubject[0]
            : derivedCredential.derived?.credentialSubject;
          expect(credentialSubject?.scac).toBeDefined();
          expect(credentialSubject?.vessel).toBeDefined();
          expect(credentialSubject?.billOfLadingName).toBeDefined();
          expect(credentialSubject?.blNumber).toBeDefined();

          // Verify the derived credential
          const verificationResult = await verifyCredential(derivedCredential.derived);
          expect(verificationResult.verified).toBe(true);
          expect(verificationResult.error).toBeUndefined();
        });

        it('should require derivation before verification', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          // Sign the credential
          const signedCredential = await signCredential(testCredential, keyPair, cryptosuite);
          expect(signedCredential.signed).toBeDefined();

          // Verify original signed credential directly (should fail)
          const verificationResult = await verifyCredential(signedCredential.signed);
          expect(verificationResult.verified).toBe(false);
          expect(verificationResult.error).toBe(
            `${cryptosuite} base credentials must be derived before verification. Use deriveCredential() first.`,
          );
        });

        it('should prevent multiple rounds of derivation', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          // Sign and first derivation
          const signedCredential = await signCredential(testCredential, keyPair, cryptosuite);
          const firstDerivedCredential = await deriveCredential(signedCredential.signed, [
            '/credentialSubject/blNumber',
          ]);
          expect(firstDerivedCredential.derived).toBeDefined();

          // Attempt second derivation (should fail)
          const secondDerivedCredential = await deriveCredential(firstDerivedCredential.derived, [
            '/credentialSubject/billOfLadingName',
          ]);
          expect(secondDerivedCredential.derived).toBeUndefined();
          expect(secondDerivedCredential.error).toBe(
            `${cryptosuite} derived credentials cannot be further derived. Multiple rounds of derivation are not supported by this cryptosuite.`,
          );
        });

        it('should detect tampered credentials', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          // Sign and derive credential
          const signedCredential = await signCredential(testCredential, keyPair, cryptosuite);
          const derivedCredential = await deriveCredential(signedCredential.signed, [
            '/credentialSubject/billOfLadingName',
          ]);

          // Tamper with the derived credential
          const tamperedCredential = {
            ...derivedCredential.derived,
            [dateField]: new Date().toISOString(),
          };

          // Verify tampered credential (should fail)
          const verificationResult = await verifyCredential(tamperedCredential);
          expect(verificationResult.verified).toBe(false);
          expect(verificationResult.error).equals('Invalid signature.');
        });

        it('should validate key pair requirements', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          const invalidKeyPair: any = {
            id: 'did:web:trustvc.github.io:did:1#multikey-1',
            type: 'Multikey',
            controller: 'did:web:trustvc.github.io:did:1',
            publicKeyMultibase: 'zDnaemDNwi4G5eTzGfRooFFu5Kns3be6yfyVNtiaMhWkZbwtc',
            // Missing secretKeyMultibase
          };

          // Sign with invalid key pair (should fail)
          const signedCredential = await signCredential(
            testCredential,
            invalidKeyPair,
            cryptosuite,
          );
          expect(signedCredential.signed).toBeUndefined();
          expect(signedCredential.error).toBe(
            '"secretKeyMultibase" property in keyPair is required.',
          );
        });

        it('should reject unsupported cryptosuites', async () => {
          const testCredential = { ...credential, [dateField]: dateValue };

          // Sign with unsupported cryptosuite (should fail)
          const signedCredential = await signCredential(
            testCredential,
            keyPair,
            'unsupported-suite' as any,
          );
          expect(signedCredential.signed).toBeUndefined();
          expect(signedCredential.error).toBe('"unsupported-suite" is not supported.');
        });
      },
    );
  });
});
