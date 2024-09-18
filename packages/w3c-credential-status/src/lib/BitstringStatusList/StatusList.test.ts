import { describe, expect, it } from 'vitest';
import { StatusList } from './StatusList';

describe('StatusList', () => {
  it('should work', async () => {
    const statusList = new StatusList({ length: 10 });
    expect(statusList.getStatus(1)).toEqual(false);
    expect(statusList.length).toEqual(10);
  });

  it('should only take length or buffer', () => {
    expect(
      () => new StatusList({ length: 10, buffer: Buffer.from('H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA') }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Only one of "length" or "buffer" must be given.]`,
    );
  });

  it('should encode', async () => {
    const statusList = new StatusList({ length: 10 });
    statusList.setStatus(1, true);
    expect(await statusList.encode()).toEqual('H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA');
  });

  it('should decode', async () => {
    const statusList = await StatusList.decode({ encodedList: 'H4sIAAAAAAAAA3NgAAD6XaCxAgAAAA' });
    expect(statusList.getStatus(1)).toEqual(true);
  });

  it('should encode and decode', async () => {
    const statusList = new StatusList({ length: 10 });
    expect(statusList.getStatus(1)).toEqual(false);
    statusList.setStatus(1, true);
    expect(statusList.getStatus(1)).toEqual(true);

    const encoded = await statusList.encode();
    const decoded = await StatusList.decode({ encodedList: encoded });
    expect(decoded.getStatus(1)).toEqual(true);
  });

  it('should throw on invalid status', () => {
    const statusList = new StatusList({ length: 10 });
    expect(() => statusList.setStatus(1, 'true' as any)).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: "status" must be a boolean.]`,
    );
  });

  it('should throw on invalid index', () => {
    const statusList = new StatusList({ length: 10 });
    expect(() => statusList.getStatus(11)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Position "11" is out of range "0-9".]`,
    );
    expect(() => statusList.setStatus(11, true)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Position "11" is out of range "0-9".]`,
    );
  });

  it('should throw on invalid encodedList', async () => {
    expect(
      StatusList.decode({ encodedList: 'invalid' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Could not decode encoded status list; reason: incorrect header check]`,
    );
  });
});
