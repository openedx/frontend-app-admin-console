import { buildWizardPath, ROUTES } from './constants';

const BASE = `${ROUTES.HOME_PATH}${ROUTES.ASSIGN_ROLE_WIZARD_PATH}`;

describe('buildWizardPath', () => {
  it('returns the base path when called with no arguments', () => {
    expect(buildWizardPath()).toBe(BASE);
  });

  it('returns the base path when called with an empty options object', () => {
    expect(buildWizardPath({})).toBe(BASE);
  });

  it('appends ?users= when only users is provided', () => {
    expect(buildWizardPath({ users: 'alice' })).toBe(`${BASE}?users=alice`);
  });

  it('appends ?from= when only from is provided', () => {
    expect(buildWizardPath({ from: '/authz/libraries/lib:123/alice' }))
      .toBe(`${BASE}?from=%2Fauthz%2Flibraries%2Flib%3A123%2Falice`);
  });

  it('appends both users and from when both are provided', () => {
    const result = buildWizardPath({ users: 'alice', from: '/authz/libraries/lib:123/alice' });
    const parsed = new URL(result, 'http://x');
    expect(parsed.pathname).toBe(BASE);
    expect(parsed.searchParams.get('users')).toBe('alice');
    expect(parsed.searchParams.get('from')).toBe('/authz/libraries/lib:123/alice');
  });

  it('omits the query string when users and from are both empty strings', () => {
    expect(buildWizardPath({ users: '', from: '' })).toBe(BASE);
  });
});
