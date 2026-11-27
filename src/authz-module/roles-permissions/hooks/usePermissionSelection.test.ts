import { act, renderHook } from '@testing-library/react';
import { buildCatalogPermission } from '@src/authz-module/catalog/testUtils';
import { usePermissionSelection } from './usePermissionSelection';

const permissions = [
  buildCatalogPermission('view'),
  buildCatalogPermission('edit', { implies: ['view'] }),
  buildCatalogPermission('manage_team'),
];

const render = (initial: { seed: { scopeType: string; permissions: string[] } | null; source: string | null }) => renderHook(
  (props: typeof initial) => usePermissionSelection(props.seed, props.source, permissions),
  { initialProps: initial },
);

describe('usePermissionSelection', () => {
  it('starts from the permissions of the seed', () => {
    const { result } = render({ seed: { scopeType: 'course-v1', permissions: ['edit'] }, source: 'role_a' });
    expect([...result.current.effective].sort()).toEqual(['edit', 'view']);
    expect(result.current.requiredBy).toEqual({ view: ['edit'] });
    expect(result.current.selectedCount).toBe(2);
  });

  it('starts empty without a seed', () => {
    const { result } = render({ seed: null, source: null });
    expect(result.current.selectedCount).toBe(0);
  });

  it('toggles a permission and a whole category', () => {
    const { result } = render({ seed: { scopeType: 'course-v1', permissions: [] }, source: null });
    act(() => result.current.toggle('manage_team'));
    expect(result.current.effective.has('manage_team')).toBe(true);
    act(() => result.current.setCategory(['view', 'edit'], true));
    expect(result.current.selectedCount).toBe(3);
    act(() => result.current.setCategory(['view', 'edit'], false));
    expect(result.current.selectedCount).toBe(1);
  });

  it('keeps the choices when the seed is recomputed for the same resource type and source role', () => {
    const { result, rerender } = render({ seed: { scopeType: 'course-v1', permissions: ['view'] }, source: 'role_a' });
    act(() => result.current.toggle('manage_team'));
    rerender({ seed: { scopeType: 'course-v1', permissions: ['view'] }, source: 'role_a' });
    expect(result.current.effective.has('manage_team')).toBe(true);
  });

  it('restarts from the new seed when the cloned role changes', () => {
    const { result, rerender } = render({ seed: { scopeType: 'course-v1', permissions: ['view'] }, source: 'role_a' });
    act(() => result.current.toggle('manage_team'));
    rerender({ seed: { scopeType: 'course-v1', permissions: ['edit'] }, source: 'role_b' });
    expect(result.current.effective.has('manage_team')).toBe(false);
    expect(result.current.effective.has('edit')).toBe(true);
  });

  it('restarts when the resource type changes', () => {
    const { result, rerender } = render({ seed: { scopeType: 'course-v1', permissions: [] }, source: null });
    act(() => result.current.toggle('manage_team'));
    rerender({ seed: { scopeType: 'lib', permissions: [] }, source: null });
    expect(result.current.selectedCount).toBe(0);
  });
});
