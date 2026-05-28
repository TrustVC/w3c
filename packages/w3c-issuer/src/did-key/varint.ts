/**
 * Minimal unsigned varint codec, sized for the multicodec prefixes used by
 * did:key (all current key types fit in <= 3 bytes). Implemented inline because
 * multiformats v9 does not export varint as a public subpath.
 */

export const decodeVarint = (
  bytes: Uint8Array,
  offset = 0,
): { value: number; bytesRead: number } => {
  let value = 0;
  let shift = 0;
  let i = offset;
  while (i < bytes.length) {
    const b = bytes[i];
    value |= (b & 0x7f) << shift;
    i++;
    if ((b & 0x80) === 0) return { value, bytesRead: i - offset };
    shift += 7;
    if (shift > 28) throw new Error('Varint too large');
  }
  throw new Error('Truncated varint');
};

export const encodeVarint = (value: number): Uint8Array => {
  if (value < 0) throw new Error('Varint must be non-negative');
  const out: number[] = [];
  let v = value;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
  return new Uint8Array(out);
};
