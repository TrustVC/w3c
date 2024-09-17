/*
 * Implementing @digitalbazaar/vc-bitstring-status-list
 */
import { Bitstring } from './Bitstring';

export type BitstringStatusListOption = {
  length?: number;
  buffer?: Buffer;
};

export class BitstringStatusList {
  bitstring: Bitstring;
  length: number;

  constructor({ length, buffer }: BitstringStatusListOption) {
    this.bitstring = new Bitstring({ length, buffer });
    this.length = this.bitstring.length;
  }

  setStatus(index: number, status: boolean): void {
    if (typeof status !== 'boolean') {
      throw new TypeError('"status" must be a boolean.');
    }
    return this.bitstring.set(index, status);
  }

  getStatus(index: number): boolean {
    return this.bitstring.get(index);
  }

  async encode(): Promise<string> {
    return await this.bitstring.encodeBits();
  }

  static async decode({ encodedList }: { encodedList: string }): Promise<BitstringStatusList> {
    try {
      const buffer = await Bitstring.decodeBits({
        encoded: encodedList,
      });
      return new BitstringStatusList({ buffer });
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`Could not decode encoded status list; reason: ${e}`);
    }
  }
}
