import React, { memo, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ClipboardList,
  Bell,
  CreditCard,
  Package,
  Handshake,
  Lock,
  Settings,
  FolderOpen,
  Plug,
  Percent,
  Banknote,
  BarChart3,
  Trophy,
} from 'lucide-react';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const SettingsSidebarComponent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAdmin } = useUserRole();

  const accountItems: MenuItem[] = useMemo(() => [
    { icon: ClipboardList, label: language === 'vi' ? 'Hồ sơ' : 'Profile', path: '/settings/profile' },
    { icon: Bell, label: language === 'vi' ? 'Thông báo' : 'Notifications', path: '/settings/notifications' },
    { icon: CreditCard, label: language === 'vi' ? 'Thanh toán' : 'Payment', path: '/settings/payment' },
    { icon: Package, label: language === 'vi' ? 'Đơn hàng' : 'Orders', path: '/settings/orders' },
    { icon: Handshake, label: 'Affiliate', path: '/settings/affiliate' },
    { icon: Lock, label: language === 'vi' ? 'Bảo mật' : 'Security', path: '/settings/security' },
  ], [language]);

  const adminItems: MenuItem[] = useMemo(() => [
    { icon: Settings, label: language === 'vi' ? 'Cài đặt chung' : 'General Settings', path: '/settings/admin/general' },
    { icon: FolderOpen, label: language === 'vi' ? 'Danh mục' : 'Categories', path: '/settings/admin/categories' },
    { icon: Plug, label: 'Plugins', path: '/settings/admin/plugins' },
    { icon: Trophy, label: 'Gamification', path: '/settings/admin/gamification' },
    { icon: Percent, label: language === 'vi' ? 'Hoa hồng' : 'Commission', path: '/settings/admin/commission' },
    { icon: Banknote, label: language === 'vi' ? 'Thanh toán' : 'Payments', path: '/settings/admin/payments' },
    { icon: BarChart3, label: language === 'vi' ? 'Thống kê' : 'Analytics', path: '/settings/admin/analytics' },
  ], [language]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-[250px] min-h-full bg-muted/30 border-r border-border flex-shrink-0">
      {/* Back Link */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'vi' ? 'Quay lại' : 'Go back'}
        </button>
      </div>

      {/* Account Section */}
      <div className="py-4">
        <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {language === 'vi' ? 'Tài khoản' : 'Account'}
        </h3>
        <nav className="space-y-1 px-2">
          {accountItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
                isActive(item.path)
                  ? 'bg-foreground text-background font-medium'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="py-4 border-t border-border">
          <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {language === 'vi' ? 'Quản trị viên' : 'Administrator'}
          </h3>
          <nav className="space-y-1 px-2">
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
                  isActive(item.path)
                    ? 'bg-foreground text-background font-medium'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </aside>
  );
};

export const SettingsSidebar = memo(SettingsSidebarComponent);
