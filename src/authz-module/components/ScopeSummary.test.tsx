import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/testUtils';
import ScopeSummary from './ScopeSummary';

describe('ScopeSummary', () => {
  describe('accessible name', () => {
    it('names the resource type, the scope and its organization for a single course', () => {
      renderWrapper(<ScopeSummary scope="course-v1:Demo+SF101+2026" scopeDisplayName="Science Fundamentals" org="Demo" />);

      expect(screen.getByRole('group', { name: 'Course Science Fundamentals in the organization Demo' })).toBeInTheDocument();
    });

    it('names the resource type, the scope and its organization for a single library', () => {
      renderWrapper(<ScopeSummary scope="lib:Demo:CSPROB" scopeDisplayName="Computer Science Problems" org="Demo" />);

      expect(screen.getByRole('group', { name: 'Library Computer Science Problems in the organization Demo' })).toBeInTheDocument();
    });

    it('falls back to the scope id when the API resolved no display name', () => {
      renderWrapper(<ScopeSummary scope="course-v1:Demo+SF101+2026" scopeDisplayName="" org="Demo" />);

      expect(screen.getByRole('group', { name: 'Course course-v1:Demo+SF101+2026 in the organization Demo' })).toBeInTheDocument();
    });

    it.each([
      ['course-v1:Demo+*', 'All courses in the organization Demo'],
      ['lib:Demo:*', 'All libraries in the organization Demo'],
    ])('names an organization-wide scope %s by its reach', (scope, name) => {
      renderWrapper(<ScopeSummary scope={scope} scopeDisplayName="" org="Demo" />);

      expect(screen.getByRole('group', { name })).toBeInTheDocument();
    });

    it.each([
      ['course-v1:*', 'All courses on the platform'],
      ['lib:*', 'All libraries on the platform'],
    ])('names a platform-wide scope %s by its reach', (scope, name) => {
      renderWrapper(<ScopeSummary scope={scope} scopeDisplayName="" org="*" />);

      expect(screen.getByRole('group', { name })).toBeInTheDocument();
    });
  });

  it('hides the visible text and icons from assistive technology, so they are not announced twice', () => {
    const { container } = renderWrapper(
      <ScopeSummary scope="course-v1:Demo+SF101+2026" scopeDisplayName="Science Fundamentals" org="Demo" />,
    );
    const group = screen.getByRole('group');

    // Every visible line, with its icon, sits under an aria-hidden ancestor inside the group.
    const visibleLines = Array.from(group.children);
    expect(visibleLines).toHaveLength(2);
    visibleLines.forEach((line) => expect(line).toHaveAttribute('aria-hidden', 'true'));
    expect(screen.getByText('Science Fundamentals').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('Demo').closest('[aria-hidden="true"]')).not.toBeNull();
    container.querySelectorAll('svg').forEach((icon) => {
      expect(icon.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });

  it('keeps the visible summary: the scope name with its organization below', () => {
    renderWrapper(<ScopeSummary scope="course-v1:Demo+SF101+2026" scopeDisplayName="Science Fundamentals" org="Demo" />);

    expect(screen.getByText('Science Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });
});
