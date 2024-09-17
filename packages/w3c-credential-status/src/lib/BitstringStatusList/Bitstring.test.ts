import { describe, expect, it } from 'vitest';
import { Bitstring } from './Bitstring';

describe('Bitstring', () => {
  it('should work', () => {
    const bitstring = new Bitstring({ length: 10 });
    expect(bitstring.get(1)).toEqual(false);
    expect(bitstring.length).toEqual(10);
  });

  it('should only take length or buffer', () => {
    expect(
      () => new Bitstring({ length: 10, buffer: Buffer.from('H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA') }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Only one of "length" or "buffer" must be given.]`,
    );
  });

  it('should set and get', () => {
    const bitstring = new Bitstring({ length: 10 });
    expect(bitstring.get(1)).toEqual(false);
    bitstring.set(1, true);
    expect(bitstring.get(1)).toEqual(true);
  });

  it('should encode', async () => {
    const bitstring = new Bitstring({ length: 10 });
    expect(await bitstring.encodeBits()).toEqual('H4sIAAAAAAAAA2NgAAD_EtlBAgAAAA');
    bitstring.set(1, true);
    expect(await bitstring.encodeBits()).toEqual('H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA');
    bitstring.set(1, false);
    expect(await bitstring.encodeBits()).toEqual('H4sIAAAAAAAAA2NgAAD_EtlBAgAAAA');
  });

  it('should decode', async () => {
    const decodedBitstring = await Bitstring.decodeBits({
      encoded: 'H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA',
    });
    const bitstring = new Bitstring({ buffer: decodedBitstring });
    expect(bitstring.get(1)).toEqual(true);
  });

  it('should compress and uncompress', async () => {
    const bitstring = new Bitstring({ length: 10 });
    bitstring.set(1, true);

    const compressed = await bitstring.compressBits();
    expect(compressed).toMatchInlineSnapshot(`
      Uint8Array [
        31,
        139,
        8,
        0,
        0,
        0,
        0,
        0,
        0,
        3,
        115,
        96,
        0,
        0,
        250,
        93,
        160,
        177,
        2,
        0,
        0,
        0,
      ]
    `);

    const uncompressedBitstring = await Bitstring.uncompressBits({ compressed: compressed });
    expect(uncompressedBitstring).toMatchInlineSnapshot(`
      Uint8Array [
        64,
        0,
      ]
    `);
  });

  it('should create bitstrng with little endian or big endian', async () => {
    const bitstring = new Bitstring({ length: 10, littleEndianBits: true });
    bitstring.set(1, true);
    const encoded = await bitstring.encodeBits();
    expect(encoded).toMatchInlineSnapshot(`"H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA"`);

    const bitstring2 = new Bitstring({ length: 10, littleEndianBits: false });
    bitstring2.set(1, true);
    const encoded2 = await bitstring2.encodeBits();
    expect(encoded2).toMatchInlineSnapshot(`"H4sIAAAAAAAAA2NiAAB9cO9zAgAAAA"`);
  });

  it('should create bitstring with left to right indexing or right to left indexing', async () => {
    const bitstring = new Bitstring({ length: 10, leftToRightIndexing: true });
    bitstring.set(1, true);
    const encoded = await bitstring.encodeBits();
    expect(encoded).toMatchInlineSnapshot(`"H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA"`);

    const bitstring2 = new Bitstring({ length: 10, leftToRightIndexing: false });
    bitstring2.set(1, true);
    const encoded2 = await bitstring2.encodeBits();
    expect(encoded2).toMatchInlineSnapshot(`"H4sIAAAAAAAAA2NiAAB9cO9zAgAAAA"`);
  });

  it('should throw error when littleEndianBits and leftToRightIndexing are both valid', () => {
    expect(
      () => new Bitstring({ length: 10, littleEndianBits: true, leftToRightIndexing: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Using both "littleEndianBits" and "leftToRightIndexing" is not allowed.]`,
    );
  });

  it('should throw on invalid position', () => {
    const bitstring = new Bitstring({ length: 10 });
    expect(() => bitstring.get(11)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Position "11" is out of range "0-9".]`,
    );
    expect(() => bitstring.set(11, true)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Position "11" is out of range "0-9".]`,
    );
  });
});
