import { describe, expect, it } from 'vitest';
import { getDocumentLoader, RENDER_CONTEXT_V2_URL } from './index';

describe('render method contexts', () => {
  it('serves render-method-context-v2 with INLINE_HTML_TEMPLATE from the bundled copy', async () => {
    const loader = await getDocumentLoader();
    const result = await loader(RENDER_CONTEXT_V2_URL);
    const context = (
      result.document as {
        '@context': {
          EMBEDDED_RENDERER: unknown;
          INLINE_HTML_TEMPLATE: { '@context': { template: unknown } };
        };
      }
    )['@context'];

    expect(context.EMBEDDED_RENDERER).toBeDefined();
    // `template` only ever holds the gzipped base64url string, so it's a plain string term and
    // is signed as a literal. An uncompressed object there fails JSON-LD safe mode, by design.
    expect(context.INLINE_HTML_TEMPLATE['@context'].template).toBe(
      'https://example.org/terms#template',
    );
  });
});
