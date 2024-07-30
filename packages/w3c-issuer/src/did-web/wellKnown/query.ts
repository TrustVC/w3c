import { getDomainHostname } from '@tradetrust-tt/w3c-utils';
import { Resolver } from 'did-resolver';
import { getResolver as webGetResolver } from 'web-did-resolver';
import { DidWellKnownDocument } from './types';

/**
 * Query well known DID document based on the domain.
 *
 * @param {string} domain - Domain to query well known DID @example https://subdomain.example.com/xxx
 * @returns {Promise<DidWellKnownDocument | undefined>} - Returns WellKnown DIDDocument if found, otherwise undefined
 */
export const queryWellKnownDid = async (
  domain: Readonly<string>,
): Promise<DidWellKnownDocument | undefined> => {
  const domainHostname = getDomainHostname(domain);

  if (!domainHostname) {
    throw new Error('Invalid / Missing domain');
  }

  const resolver = new Resolver({
    ...webGetResolver(),
  });

  const doc = await resolver.resolve(`did:web:${domainHostname}`);

  return doc.didDocument as DidWellKnownDocument;
};
