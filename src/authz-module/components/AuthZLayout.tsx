import { ReactNode } from 'react';
import { StudioHeader } from '@edx/frontend-component-header';
import AuthZTitle, { AuthZTitleProps } from './AuthZTitle';

interface AuthZLayoutProps extends AuthZTitleProps {
  children: ReactNode;
  context: {
    id: string;
    org: string;
    title: string;
  }
}

const AuthZLayout = ({ children, context, ...props }: AuthZLayoutProps) => (
  <>
    <StudioHeader
      number={context?.id || null}
      org={context?.org || null}
      title={context?.title || null}
      isHiddenMainMenu
    />
    <AuthZTitle {...props} />
    {children}
  </>

);

export default AuthZLayout;
