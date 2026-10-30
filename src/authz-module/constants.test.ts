import {
  AUTHZ_HOME_PATH, buildAuditUserPath, getAggregateScopeType,
  getOrgAggregateScopeKey, getPlatformAggregateScopeKey,
} from './constants';
import type { ContextType } from './constants';

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
  it('returns course wildcard scope for course context', () => {
    expect(getOrgAggregateScopeKey('course', 'MIT')).toBe('course-v1:MIT+*');
  });

  it('returns library wildcard scope for library context', () => {
    expect(getOrgAggregateScopeKey('library', 'MIT')).toBe('lib:MIT:*');
  });

  it('throws for an unknown contextType', () => {
    expect(() => getOrgAggregateScopeKey('unknown' as ContextType, 'MIT')).toThrow('Unknown contextType: "unknown"');
  });
});

describe('getPlatformAggregateScopeKey', () => {
  it('returns the platform-wide course wildcard scope for course context', () => {
    expect(getPlatformAggregateScopeKey('course')).toBe('course-v1:*');
  });

  it('returns the platform-wide library wildcard scope for library context', () => {
    expect(getPlatformAggregateScopeKey('library')).toBe('lib:*');
  });

  it('throws for an unknown contextType', () => {
    expect(() => getPlatformAggregateScopeKey('unknown' as ContextType)).toThrow('Unknown contextType: "unknown"');
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
