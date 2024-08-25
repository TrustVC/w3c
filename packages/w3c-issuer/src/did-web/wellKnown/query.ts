import { getDomain } from '../../lib';
import { Resolver } from 'did-resolver';
import { getResolver as webGetResolver } from 'web-did-resolver';
import { DidWellKnownDocument, QueryDidWellKnownDocument } from './types';

/**
 * Query well known DID document based on the domain.
 *
 * @param {string} domain - Domain to query well known DID @example https://subdomain.example.com/xxx
 * @returns {Promise<DidWellKnownDocument | undefined>} - Returns WellKnown DIDDocument if found, otherwise undefined
 */
export const queryWellKnownDid = async (
  domain: Readonly<string>,
): Promise<QueryDidWellKnownDocument> => {
  const domainHostname = getDomain(domain);

  if (!domainHostname) {
    throw new Error('Invalid / Missing domain');
  }

  const resolver = new Resolver({
    ...webGetResolver(),
  });

  const did = `did:web:${domainHostname?.replace(/\//g, ':')}`;
  const doc = await resolver.resolve(did);

  return {
    wellKnownDid: doc?.didDocument as DidWellKnownDocument,
    did,
  };
};
