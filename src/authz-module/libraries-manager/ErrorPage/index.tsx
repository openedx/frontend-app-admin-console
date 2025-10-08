import { useState } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Container, Hyperlink, Row } from '@openedx/paragon';
import { CUSTOM_ERRORS, ERROR_STATUS } from '@src/constants';

import messages from './messages';

const getErrorConfig = ({ errorMessage, errorStatus }) => {
	if (errorMessage == CUSTOM_ERRORS.NO_ACCESS || ERROR_STATUS.NO_ACCESS.includes(errorStatus)) {
		return ({
			title: messages['error.page.title.noAccess'],
			description: messages['error.page.message.noAccess'],
			statusCode: errorStatus || ERROR_STATUS.NO_ACCESS[0],
			showBackButton: true,
		});
	}
	if (errorMessage == CUSTOM_ERRORS.NOT_FOUND || ERROR_STATUS.NOT_FOUND.includes(errorStatus)) {
		return ({
			title: messages['error.page.title.notFound'],
			description: messages['error.page.message.notFound'],
			statusCode: errorStatus || ERROR_STATUS.NOT_FOUND[0],
			showBackButton: true,
		});
	}
	if (errorMessage == CUSTOM_ERRORS.SERVER_ERROR || ERROR_STATUS.SERVER_ERROR.includes(errorStatus)) {
		return ({
			title: messages['error.page.title.server'],
			description: messages['error.page.message.server'],
			statusCode: errorStatus || ERROR_STATUS.SERVER_ERROR[0],
			showBackButton: true,
			showReloadButton: true,
		});
	}
	return ({
		title: messages['error.page.title.generic'],
		description: messages['error.page.message.generic'],
		showBackButton: true,
		showReloadButton: true,
	});
}

const LIBRARIES_URL = `${getConfig().AUTHORING_BASE_URL}/authoring/libraries`;

const ErrorPage = ({ error, resetErrorBoundary }: FallbackProps) => {
	const intl = useIntl();
	const [reloading, setReloading] = useState(false);

	const errorStatus: number = error?.customAttributes?.httpErrorStatus;
	const errorMessage: string = error?.message;
	const { title, description, statusCode, showBackButton, showReloadButton } = getErrorConfig({ errorMessage, errorStatus });


	const handleReload = () => {
		if (reloading) { return; }
		setReloading(true);
		resetErrorBoundary()
	}
	return (
		<Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light-200" data-testid="error-page">
			<h1 className='display-4 text-primary-200'>{statusCode}</h1>
			<h1 className='text-primary'>{intl.formatMessage(title)}</h1>
			<p>{intl.formatMessage(description)}</p>
			<Row>
				{showReloadButton && (
					<Button
						className='m-2'
						disabled={reloading}
						onClick={handleReload}
					>
						{intl.formatMessage(messages['error.page.action.reload'])}
					</Button>)}
				{showBackButton && (
					<Button
						as={Hyperlink}
						destination={LIBRARIES_URL}
						className='m-2'
						variant={showReloadButton ? 'outline-primary' : 'primary'}
					>
						{intl.formatMessage(messages['error.page.action.back'])}
					</Button>
				)}

			</Row>
		</Container>
	)
};

const LibrariesErrorFallback = (props: FallbackProps) => {
	return <ErrorPage {...props} />;
}
export default LibrariesErrorFallback;
