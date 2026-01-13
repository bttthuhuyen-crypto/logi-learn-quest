import { Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-64px)]">
        <SettingsSidebar />
        <div className="flex-1 bg-background">
          <Outlet />
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
