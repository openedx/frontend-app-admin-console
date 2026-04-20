import { getPermissionsCountByRole } from './utils';

describe('getPermissionsCountByRole', () => {
  it('returns a number', () => {
    const result = getPermissionsCountByRole();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
