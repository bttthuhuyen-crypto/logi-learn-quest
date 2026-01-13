import { ReactNode } from 'react';
import { Header } from './Header';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/AuthContext';

export interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export const MainLayout = ({ children, hideHeader = false }: MainLayoutProps) => {
  const { user } = useAuth();
  
  // Track user presence when logged in
  useUserPresence();

  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && <Header />}
      <main>{children}</main>
    </div>
  );
};
