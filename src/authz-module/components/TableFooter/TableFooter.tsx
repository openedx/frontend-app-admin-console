import React, { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTableContext, Pagination, TableFooter } from '@openedx/paragon';
import messages from '../messages';

const Footer = () => {
  const { formatMessage } = useIntl();
  const {
    pageCount, gotoPage, state, itemCount, rows,
  // @ts-ignore-next-line - Paragon's DataTableContext is not typed
  } = useContext<DataTableContext>(DataTableContext);
  const { pageIndex } = state;
  return (
    <TableFooter>
      <span>
        {formatMessage(messages['authz.table.footer.items.showing.text'], { pageSize: rows.length, itemCount })}
      </span>
      <Pagination
        variant="reduced"
        currentPage={pageIndex + 1}
        pageCount={pageCount}
        paginationLabel="Table pagination"
        onPageSelect={(pageNum) => gotoPage(pageNum - 1)}
      />
    </TableFooter>
  );
};

export default Footer;
