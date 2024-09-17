/*!
 * Copyright (c) 2020-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as assert from './assertions';
// @ts-ignore: No types available for pako
import { gzip, ungzip } from 'pako';

export type BitstringType = {
  length?: number;
  buffer?: Uint8Array;
  leftToRightIndexing?: boolean;
  littleEndianBits?: boolean;
};

export class Bitstring {
  leftToRightIndexing: boolean;
  bits: Uint8Array;
  length: number;

  /**
   * Creates a new Bitstring instance.
   *
   * @param {object} options - The options to use.
   * @param {Number} [options.length] - The length of the bitstring in bits;
   *   either this or `buffer` must be given, but not both.
   * @param {Uint8Array} [options.buffer] - The bitstring as a buffer of bytes
   *   where the bytes are always in big endian order (left most byte or most
   *   significant byte in the buffer will be the least significant and lowest
   *   index byte in the bitstring) and where the bit order
   *   is also little endian by default but may be specified as big endian
   *   by passing `leftToRightIndexing: false`; either this parameter or
   *   `length` must be given but not both.
   * @param {Boolean} [options.leftToRightIndexing=true] - Whether the bit
   *   order (NOT the byte order, which is *always* first byte in the buffer is
   *   the first byte-index into the bitstring, i.e., left to right) is left to
   *   right or not; the default is left to right, which matches what the byte
   *   order always is and, specifically, means that `0x80` or `0b1000000`
   *   means the first bit index is set in a given byte.
   * @param {Boolean} [options.littleEndianBits] - Deprecated; use
   *   `leftToRightIndexing` instead.
   */
  constructor({ length, buffer, leftToRightIndexing, littleEndianBits }: BitstringType = {}) {
    if (length && buffer) {
      throw new Error('Only one of "length" or "buffer" must be given.');
    }
    if (length !== undefined) {
      assert.isPositiveInteger(length, 'length');
    } else {
      assert.isUint8Array(buffer, 'buffer');
    }
    // backwards compatibility for deprecated name `littleEndianBits`
    if (littleEndianBits !== undefined) {
      if (leftToRightIndexing !== undefined) {
        throw new Error(
          'Using both "littleEndianBits" and "leftToRightIndexing" ' + 'is not allowed.',
        );
      }
      assert.isBoolean(littleEndianBits, 'littleEndianBits');
      leftToRightIndexing = littleEndianBits;
    }
    if (leftToRightIndexing === undefined) {
      leftToRightIndexing = true;
    } else {
      assert.isBoolean(leftToRightIndexing, 'leftToRightIndexing');
    }
    if (length) {
      this.bits = new Uint8Array(Math.ceil(Number(length) / 8));
      this.length = length;
    } else {
      this.bits = new Uint8Array(buffer.buffer);
      this.length = buffer.length * 8;
    }
    this.leftToRightIndexing = leftToRightIndexing;
  }

  set(position: number, on: boolean) {
    assert.isNumber(position, 'position');
    assert.isBoolean(on, 'on');
    const { length, leftToRightIndexing } = this;
    const { index, bit } = _parsePosition(position, length, leftToRightIndexing);
    if (on) {
      this.bits[index] |= bit;
    } else {
      this.bits[index] &= 0xff ^ bit;
    }
  }

  get(position: number): boolean {
    assert.isNumber(position, 'position');
    const { length, leftToRightIndexing } = this;
    const { index, bit } = _parsePosition(position, length, leftToRightIndexing);
    return !!(this.bits[index] & bit);
  }

  async encodeBits() {
    // @ts-ignore: No types available for base64url-universal
    const base64url = await import('base64url-universal');

    return base64url.encode(gzip(this.bits));
  }

  static async decodeBits({ encoded }: { encoded: string }) {
    // @ts-ignore: No types available for base64url-universal
    const base64url = await import('base64url-universal');

    assert.isString(encoded, 'encoded');
    return ungzip(base64url.decode(encoded));
  }

  async compressBits() {
    return gzip(this.bits);
  }

  static async uncompressBits({ compressed }: { compressed: Uint8Array }) {
    assert.isUint8Array(compressed, 'compressed');
    return ungzip(compressed);
  }
}

function _parsePosition(position: number, length: number, leftToRightIndexing: boolean) {
  assert.isNonNegativeInteger(position, 'position');
  assert.isPositiveInteger(length, 'length');
  assert.isBoolean(leftToRightIndexing, 'leftToRightIndexing');

  if (position >= length) {
    throw new Error(`Position "${position}" is out of range "0-${Number(length) - 1}".`);
  }
  const index = Math.floor(Number(position) / 8);
  const rem = Number(position) % 8;
  const shift = leftToRightIndexing ? 7 - rem : rem;
  const bit = 1 << shift;
  return { index, bit };
}
