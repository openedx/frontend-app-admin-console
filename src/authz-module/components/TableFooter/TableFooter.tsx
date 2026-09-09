import { useContext } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { DataTableContext, Pagination, TableFooter } from '@openedx/paragon';
import messages from '@src/authz-module/components/messages';

const Footer = () => {
  const { formatMessage } = useIntl();
  const {
    pageCount, gotoPage, state, itemCount, rows,
  // @ts-expect-error - Paragon's DataTableContext is not typed
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
        paginationLabel={formatMessage(messages['authz.table.footer.pagination.label'])}
        onPageSelect={(pageNum) => gotoPage(pageNum - 1)}
      />
    </TableFooter>
  );
};

export default Footer;
