/**
 * Minimal unsigned varint codec, sized for the multicodec prefixes used by
 * did:key (all current key types fit in <= 3 bytes). Implemented inline because
 * multiformats v9 does not export varint as a public subpath.
 */

// Multicodec prefixes used by did:key all fit in <= 3 bytes. Capping here
// rejects non-canonical longer encodings of the same numeric value (e.g. a
// 5-byte prefix whose 32-bit-truncated value collides with a supported codec).
const MAX_PREFIX_BYTES = 3;

export const decodeVarint = (
  bytes: Uint8Array,
  offset = 0,
): { value: number; bytesRead: number } => {
  let value = 0;
  let multiplier = 1;
  let i = offset;
  while (i < bytes.length) {
    if (i - offset >= MAX_PREFIX_BYTES) {
      throw new Error('Varint exceeds maximum length for did:key multicodec prefix');
    }
    const b = bytes[i];
    value += (b & 0x7f) * multiplier;
    i++;
    if (!Number.isSafeInteger(value)) throw new Error('Varint too large');
    if ((b & 0x80) === 0) return { value, bytesRead: i - offset };
    multiplier *= 128;
  }
  throw new Error('Truncated varint');
};

export const encodeVarint = (value: number): Uint8Array => {
  if (!Number.isInteger(value) || value < 0)
    throw new Error('Varint must be a non-negative integer');
  const out: number[] = [];
  let v = value;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v = Math.floor(v / 128);
  }
  out.push(v);
  return new Uint8Array(out);
};
