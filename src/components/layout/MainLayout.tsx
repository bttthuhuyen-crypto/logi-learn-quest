import { ReactNode } from 'react';
import { Header } from './Header';

export interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export const MainLayout = ({ children, hideHeader = false }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && <Header />}
      <main>{children}</main>
    </div>
  );
};
