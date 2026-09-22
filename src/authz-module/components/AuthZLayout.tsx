import { ReactNode } from 'react';
import AuthZTitle, { AuthZTitleProps } from './AuthZTitle';

interface AuthZLayoutProps extends AuthZTitleProps {
  children: ReactNode;
}

/**
 * Page chrome for the authz module: the title band, then the body below it.
 * The body only paints its colour, edge to edge. Each page marks the parts of its
 * content that should line up with the header using `page-band`, so anything meant
 * to bleed across the full width -- a stepper header, a toolbar -- simply omits it.
 */
const AuthZLayout = ({ children, ...titleProps }: AuthZLayoutProps) => (
  <div className="authz-module">
    <AuthZTitle {...titleProps} />
    <div className="bg-light-200">
      {children}
    </div>
  </div>
);

export default AuthZLayout;
