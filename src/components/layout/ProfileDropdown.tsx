import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, Users, LogOut, Globe, LayoutDashboard, BookOpen, CreditCard, ChevronDown, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { useUserRole } from '@/hooks/useUserRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProfileDropdownProps {
  className?: string;
}

export const ProfileDropdown = ({ className }: ProfileDropdownProps) => {
  const { user, profile, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUsername = () => {
    if (user?.email) {
      return '@' + user.email.split('@')[0];
    }
    return '';
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 px-2 py-1.5 h-auto ${className}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-[280px] rounded-xl shadow-lg bg-background border"
        align="end"
        sideOffset={8}
      >
        {/* Header Section */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-base font-medium">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {getUsername()}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                  <Star className="h-3 w-3" />
                  {t.common.level} {profile?.level || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Member Menu Items */}
        <div className="py-1">
          <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
            <Link to="/settings/profile" className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{t.nav.profile}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
            <Link to="/settings" className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>{t.common.settings}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
            <Link to="/settings/affiliate" className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{t.nav.affiliate}</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Language Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="px-4 py-2.5 cursor-pointer">
            <Globe className="h-4 w-4 text-muted-foreground mr-3" />
            <span>{language === 'vi' ? 'Ngôn ngữ' : 'Language'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="rounded-lg bg-background">
            <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <DropdownMenuRadioItem value="vi" className="cursor-pointer">
                🇻🇳 Tiếng Việt
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="en" className="cursor-pointer">
                🇺🇸 English
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="px-4 py-2.5 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span>{t.nav.logout}</span>
        </DropdownMenuItem>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {language === 'vi' ? 'Quản trị' : 'Admin'}
            </DropdownMenuLabel>
            
            <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
              <Link to="/admin" className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
              <Link to="/members" className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{t.nav.members}</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
              <Link to="/classroom" className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{t.nav.classroom}</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
              <Link to="/admin/orders" className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{language === 'vi' ? 'Đơn hàng' : 'Orders'}</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer">
              <Link to="/admin/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>{t.common.settings}</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
