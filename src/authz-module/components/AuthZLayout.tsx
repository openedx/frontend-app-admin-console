import { ReactNode } from 'react';
import AuthZTitle, { AuthZTitleProps } from './AuthZTitle';

interface AuthZLayoutProps extends AuthZTitleProps {
  children: ReactNode;
  context: {
    id: string;
    org: string;
    title: string;
  };
}

const AuthZLayout = ({ children, ...props }: AuthZLayoutProps) => (
  <>
    <AuthZTitle {...props} />
    {children}
  </>

);

export default AuthZLayout;
