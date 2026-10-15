import {
  AUTHZ_HOME_PATH, buildAuditUserPath, getAggregateScopeType,
  getOrgAggregateScopeKey, getPlatformAggregateScopeKey, SCOPE_TYPES,
} from './constants';

describe('buildAuditUserPath', () => {
  it('builds the absolute audit path for a username', () => {
    expect(buildAuditUserPath('alice')).toBe(`${AUTHZ_HOME_PATH}/user/alice`);
  });

  it('URL-encodes the username', () => {
    expect(buildAuditUserPath('user+with@special.chars'))
      .toBe(`${AUTHZ_HOME_PATH}/user/user%2Bwith%40special.chars`);
  });
});

describe('getOrgAggregateScopeKey', () => {
  it('returns course wildcard scope for the course scope type', () => {
    expect(getOrgAggregateScopeKey(SCOPE_TYPES.COURSE, 'MIT')).toBe('course-v1:MIT+*');
  });

  it('returns library wildcard scope for the library scope type', () => {
    expect(getOrgAggregateScopeKey(SCOPE_TYPES.LIBRARY, 'MIT')).toBe('lib:MIT:*');
  });

  it('throws for an unknown scope type', () => {
    expect(() => getOrgAggregateScopeKey('unknown', 'MIT')).toThrow('Unknown scopeType: "unknown"');
  });
});

describe('getPlatformAggregateScopeKey', () => {
  it('returns the platform-wide course wildcard scope for the course scope type', () => {
    expect(getPlatformAggregateScopeKey(SCOPE_TYPES.COURSE)).toBe('course-v1:*');
  });

  it('returns the platform-wide library wildcard scope for the library scope type', () => {
    expect(getPlatformAggregateScopeKey(SCOPE_TYPES.LIBRARY)).toBe('lib:*');
  });

  it('throws for an unknown scope type', () => {
    expect(() => getPlatformAggregateScopeKey('unknown')).toThrow('Unknown scopeType: "unknown"');
  });
});
describe('getAggregateScopeType', () => {
  it('recognizes the platform-wide course scope', () => {
    expect(getAggregateScopeType('course-v1:*', '*')).toBe('platform');
  });

  it('recognizes the platform-wide library scope', () => {
    expect(getAggregateScopeType('lib:*', '*')).toBe('platform');
  });

  it('recognizes an org-wide course scope', () => {
    expect(getAggregateScopeType('course-v1:MIT+*', 'MIT')).toBe('org');
  });

  it('recognizes an org-wide library scope', () => {
    expect(getAggregateScopeType('lib:MIT:*', 'MIT')).toBe('org');
  });

  it('returns null for a single course scope', () => {
    expect(getAggregateScopeType('course-v1:MIT+DemoX+2024', 'MIT')).toBeNull();
  });

  it('returns null for a single library scope', () => {
    expect(getAggregateScopeType('lib:MIT:demo', 'MIT')).toBeNull();
  });

  it('returns null for an org-wide scope when the org is unknown', () => {
    expect(getAggregateScopeType('course-v1:MIT+*')).toBeNull();
  });

  it('returns null when the scope belongs to a different org', () => {
    expect(getAggregateScopeType('course-v1:MIT+*', 'HarvardX')).toBeNull();
  });
});
