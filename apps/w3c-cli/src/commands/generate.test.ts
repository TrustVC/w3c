import { GenerateKeyPairOptions, VerificationType, generateKeyPair } from '@tradetrust-tt/w3c-issuer';
import { describe, expect, it } from 'vitest';


describe("generate", () => {

    it("should generate random key pair", async () => {
        const mockSeed = "FVj12jBiBUqYFaEUkTuwAD73p9Hx5NzCJBge74nTguQN";
        const generateKeypairOption: GenerateKeyPairOptions = {
            type: VerificationType.Bls12381G2Key2020
        }
        const keypair = await generateKeyPair(generateKeypairOption)
        console.log(keypair)
        expect(keypair.type).toBe(VerificationType.Bls12381G2Key2020);
    })
})