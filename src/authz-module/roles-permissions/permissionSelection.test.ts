import { buildCatalogPermission } from '@src/authz-module/catalog/testUtils';
import {
  getCategoryTally, resolveSelection, setCategorySelection, togglePermission,
} from './permissionSelection';

const permissions = [
  buildCatalogPermission('view'),
  buildCatalogPermission('edit', { implies: ['view'] }),
  buildCatalogPermission('publish', { implies: ['edit'] }),
  buildCatalogPermission('manage_team'),
  buildCatalogPermission('loop_a', { implies: ['loop_b'] }),
  buildCatalogPermission('loop_b', { implies: ['loop_a'] }),
];

describe('resolveSelection', () => {
  it('grants only what was chosen when nothing implies anything', () => {
    const { effective, requiredBy } = resolveSelection(['manage_team'], permissions);
    expect([...effective]).toEqual(['manage_team']);
    expect(requiredBy).toEqual({});
  });

  it('adds the dependencies of a chosen permission and names who requires them', () => {
    const { effective, requiredBy } = resolveSelection(['edit'], permissions);
    expect([...effective].sort()).toEqual(['edit', 'view']);
    expect(requiredBy).toEqual({ view: ['edit'] });
  });

  it('follows dependencies transitively and lists every chosen requirer', () => {
    const { effective, requiredBy } = resolveSelection(['publish', 'edit'], permissions);
    expect([...effective].sort()).toEqual(['edit', 'publish', 'view']);
    expect(requiredBy).toEqual({ edit: ['publish'], view: ['edit', 'publish'] });
  });

  it('tolerates dependency cycles', () => {
    const { effective, requiredBy } = resolveSelection(['loop_a'], permissions);
    expect([...effective].sort()).toEqual(['loop_a', 'loop_b']);
    expect(requiredBy).toEqual({ loop_b: ['loop_a'] });
  });

  it('keeps ids that are not in the catalog', () => {
    expect([...resolveSelection(['gone'], permissions).effective]).toEqual(['gone']);
  });
});

describe('togglePermission', () => {
  it('turns a permission on and off', () => {
    const on = togglePermission([], 'view', permissions);
    expect(on).toEqual(['view']);
    expect(togglePermission(on, 'view', permissions)).toEqual([]);
  });

  it('does nothing to a permission another chosen one requires', () => {
    expect(togglePermission(['edit', 'view'], 'view', permissions)).toEqual(['edit', 'view']);
  });

  it('does nothing to an auto-enabled permission that was not chosen', () => {
    expect(togglePermission(['edit'], 'view', permissions)).toEqual(['edit']);
  });

  it('releases a dependency once its requirer is turned off', () => {
    const selected = togglePermission(['edit'], 'edit', permissions);
    expect(resolveSelection(selected, permissions).effective.size).toBe(0);
  });
});

describe('setCategorySelection', () => {
  it('turns on the missing permissions without duplicating chosen ones', () => {
    expect(setCategorySelection(['view'], ['view', 'edit'], true)).toEqual(['view', 'edit']);
  });

  it('turns off the permissions of the category and keeps the rest', () => {
    expect(setCategorySelection(['view', 'edit', 'manage_team'], ['view', 'edit'], false)).toEqual(['manage_team']);
  });

  it('leaves a permission enabled when one outside the category still needs it', () => {
    const selected = setCategorySelection(['view', 'publish'], ['view'], false);
    expect(resolveSelection(selected, permissions).effective.has('view')).toBe(true);
  });
});

describe('getCategoryTally', () => {
  it('counts the granted permissions of a category, dependencies included', () => {
    const { effective } = resolveSelection(['edit'], permissions);
    expect(getCategoryTally(effective, ['view', 'edit', 'publish'])).toEqual({ selected: 2, total: 3 });
  });
});
