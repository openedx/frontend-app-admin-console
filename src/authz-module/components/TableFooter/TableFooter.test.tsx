import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTableContext } from '@openedx/paragon';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import Footer from './TableFooter';

describe('TableFooter', () => {
  const mockGotoPage = jest.fn();

  const defaultDataTableContext = {
    pageCount: 5,
    gotoPage: mockGotoPage,
    state: {
      pageIndex: 0,
      pageSize: 10,
    },
    itemCount: 42,
    rows: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ],
  };

  const renderFooter = (contextOverrides = {}) => {
    const contextValue = {
      ...defaultDataTableContext,
      ...contextOverrides,
    };

    return renderWrapper(
      <DataTableContext.Provider value={contextValue}>
        <Footer />
      </DataTableContext.Provider>,
    );
  };

  beforeAll(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pagination text display', () => {
    it('displays correct showing text with current page items', () => {
      renderFooter();

      expect(screen.getByText('Showing 3 of 42 users.')).toBeInTheDocument();
    });

    it('displays showing text with different row count', () => {
      const moreRows = [
        ...defaultDataTableContext.rows,
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
      ];

      renderFooter({
        rows: moreRows,
        itemCount: 100,
      });

      expect(screen.getByText('Showing 5 of 100 users.')).toBeInTheDocument();
    });

    it('displays showing text when on last page with fewer items', () => {
      renderFooter({
        state: {
          pageIndex: 4,
          pageSize: 10,
        },
        rows: [{ id: 41, name: 'Item 41' }, { id: 42, name: 'Item 42' }],
        itemCount: 42,
      });

      expect(screen.getByText('Showing 2 of 42 users.')).toBeInTheDocument();
    });
  });

  describe('pagination controls', () => {
    it('displays pagination with correct current page', () => {
      renderFooter();

      const pagination = screen.getByRole('navigation');
      expect(pagination).toBeInTheDocument();

      const currentPageButton = screen.getByRole('button', { name: '1 of 5' });
      expect(currentPageButton).toBeInTheDocument();
    });

    it('navigates to different page when next button is clicked', async () => {
      const user = userEvent.setup();
      renderFooter();

      const page3Button = screen.getByRole('button', { name: 'Next, Page 2' });
      await user.click(page3Button);

      expect(mockGotoPage).toHaveBeenCalledTimes(1);
    });

    it('shows correct current page when on different page', () => {
      renderFooter({
        state: {
          pageIndex: 2,
          pageSize: 10,
        },
      });

      const currentPageButton = screen.getByRole('button', { name: '3 of 5' });
      expect(currentPageButton).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('handles keyboard navigation on pagination', async () => {
      const user = userEvent.setup();
      renderFooter();

      // Tab to the next page button and activate with Enter
      const nextPageButton = screen.getByRole('button', { name: 'Next, Page 2' });
      nextPageButton.focus();
      await user.keyboard('{Enter}');

      expect(mockGotoPage).toHaveBeenCalledWith(1);
    });

    it('handles space key activation on pagination buttons', async () => {
      const user = userEvent.setup();
      renderFooter();

      const nextPageButton = screen.getByRole('button', { name: 'Next, Page 2' });
      nextPageButton.focus();
      await user.keyboard(' ');

      expect(mockGotoPage).toHaveBeenCalledWith(1);
    });
  });

  describe('edge cases', () => {
    it('handles single page scenario', () => {
      renderFooter({
        pageCount: 1,
        state: {
          pageIndex: 0,
          pageSize: 10,
        },
        itemCount: 3,
      });

      expect(screen.getByText('Showing 3 of 3 users.')).toBeInTheDocument();

      const page1Button = screen.queryByRole('button', { name: /1 of 1/ });
      expect(page1Button).not.toBeInTheDocument();
    });

    it('handles empty results', () => {
      renderFooter({
        rows: [],
        itemCount: 0,
        pageCount: 1,
        state: {
          pageIndex: 0,
          pageSize: 10,
        },
      });

      expect(screen.getByText('Showing 0 of 0 users.')).toBeInTheDocument();
    });

    it('handles large page counts correctly', () => {
      renderFooter({
        pageCount: 10,
        state: {
          pageIndex: 5,
          pageSize: 10,
        },
        itemCount: 95,
      });

      const currentPageButton = screen.getByRole('button', { name: '6 of 10' });
      expect(currentPageButton).toBeInTheDocument();
      expect(screen.getByText('Showing 3 of 95 users.')).toBeInTheDocument();
    });
  });
});
