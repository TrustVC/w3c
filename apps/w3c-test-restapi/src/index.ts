import { generateKeyPair } from '@tradetrust-tt/w3c-issuer';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { issueDID } from './verify_idvc.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use([
  express.json({ limit: '50mb' }), // json
  (req: Request, res: Response, next: NextFunction) => {
    console.log({
      url: req.url,
      method: req.method,
      // body: req.body
    });
    next();
  },
]);

app.get('/issue_didweb', async (req: Request, res: Response) => {
  try {
    const { seedBase58, privateKeyBase58, publicKeyBase58, domain, type } = req.body;
    const result = await issueDID({ domain, type, seedBase58, privateKeyBase58, publicKeyBase58 });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.get('/new_private_key', async (req: Request, res: Response) => {
  try {
    const { seedBase58, privateKeyBase58, publicKeyBase58, type } = req.body;
    const result = await generateKeyPair({ type, seedBase58, privateKeyBase58, publicKeyBase58 });

    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error?.message });
  }
});

app.get('/.well-known/did.json', async (req: Request, res: Response) => {
  res.type('application/did+ld+json').json({
    id: 'did:web:localhost.com',
    verificationMethod: [
      {
        type: 'Bls12381G2Key2020',
        id: 'did:web:localhost.com#keys-1',
        controller: 'did:web:localhost.com',
        publicKeyBase58:
          'yeFTpcEiuHVwhWuBfkKfuS6UVowJciCxTL7meFXjhu1vUAk1yYf8FbTk3BjiBgiyHXasTgznidM6WTSzxBYhXwfqEGbFSZToVxbhTQ1A1HYcnUuiocFgTAoyfCvbAhijdwx',
      },
    ],
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/bls12381-2020/v1',
    ],
    assertionMethod: ['did:web:localhost.com#keys-1'],
    capabilityInvocation: ['did:web:localhost.com#keys-1'],
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
