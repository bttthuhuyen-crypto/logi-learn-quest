import { ReactNode, memo, useMemo } from 'react';
import { Header } from './Header';

export interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

const MainLayoutComponent = ({ children, hideHeader = false }: MainLayoutProps) => {
  // Memoize header to prevent re-renders when children change
  const header = useMemo(() => {
    if (hideHeader) return null;
    return <Header />;
  }, [hideHeader]);

  return (
    <div className="min-h-screen bg-background">
      {header}
      <main>{children}</main>
    </div>
  );
};

// Memoize MainLayout to prevent unnecessary re-renders
export const MainLayout = memo(MainLayoutComponent);
