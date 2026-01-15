import { ReactNode, memo, useMemo, CSSProperties } from 'react';
import { Header } from './Header';

export interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

// Performance CSS to reduce browser paint/layout work
const mainContainerStyle: CSSProperties = {
  contentVisibility: 'auto',
  contain: 'layout',
};

const MainLayoutComponent = ({ children, hideHeader = false }: MainLayoutProps) => {
  // Memoize header to prevent re-renders when children change
  const header = useMemo(() => {
    if (hideHeader) return null;
    return <Header />;
  }, [hideHeader]);

  return (
    <div className="min-h-screen bg-background">
      {header}
      <main style={mainContainerStyle}>{children}</main>
    </div>
  );
};

// Memoize MainLayout to prevent unnecessary re-renders
export const MainLayout = memo(MainLayoutComponent);
