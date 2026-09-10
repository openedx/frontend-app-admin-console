import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTableContext, Pagination, TableFooter } from '@openedx/paragon';
import messages from '../messages';

const defaultShowingMessage = messages['authz.table.footer.items.showing.text'];

interface FooterProps {
  /**
   * Overrides the "Showing X of Y." text — used by tables whose rows are not
   * assignments (e.g. the team members table counts users). Receives `pageSize`
   * and `itemCount`.
   */
  showingMessage?: typeof defaultShowingMessage;
}

const Footer = ({ showingMessage }: FooterProps) => {
  const { formatMessage } = useIntl();
  const {
    pageCount, gotoPage, state, itemCount, rows,
  // @ts-ignore-next-line - Paragon's DataTableContext is not typed
  } = useContext<DataTableContext>(DataTableContext);
  const { pageIndex } = state;
  return (
    <TableFooter>
      <span>
        {formatMessage(showingMessage ?? defaultShowingMessage, { pageSize: rows.length, itemCount })}
      </span>
      <Pagination
        variant="reduced"
        currentPage={pageIndex + 1}
        pageCount={pageCount}
        paginationLabel={formatMessage(messages['authz.table.footer.pagination.label'])}
        onPageSelect={(pageNum) => gotoPage(pageNum - 1)}
      />
    </TableFooter>
  );
};

export default Footer;
