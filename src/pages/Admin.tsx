import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MembershipRequestsPanel } from '@/components/admin/MembershipRequestsPanel';
import { MembershipSettingsPanel } from '@/components/admin/MembershipSettingsPanel';
import { AffiliateSettingsPanel } from '@/components/admin/AffiliateSettingsPanel';
import { PayoutRequestsPanel } from '@/components/admin/PayoutRequestsPanel';
import { ChatSettingsPanel } from '@/components/admin/ChatSettingsPanel';
import { Shield, Users, Settings, Handshake, Wallet, MessageCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const { language, t } = useLanguage();
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState('requests');

  if (loading || roleLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'vi' ? 'Quản trị cộng đồng' : 'Community Administration'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'vi' ? 'Quản lý thành viên và cài đặt cộng đồng' : 'Manage members and community settings'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === 'vi' ? 'Yêu cầu tham gia' : 'Membership Requests'}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {language === 'vi' ? 'Cài đặt câu hỏi' : 'Question Settings'}
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {language === 'vi' ? 'Cài đặt Chat' : 'Chat Settings'}
            </TabsTrigger>
            <TabsTrigger value="affiliate" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              {language === 'vi' ? 'Cài đặt Affiliate' : 'Affiliate Settings'}
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {language === 'vi' ? 'Yêu cầu rút tiền' : 'Payout Requests'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <MembershipRequestsPanel />
          </TabsContent>

          <TabsContent value="settings">
            <MembershipSettingsPanel />
          </TabsContent>

          <TabsContent value="chat">
            <ChatSettingsPanel />
          </TabsContent>

          <TabsContent value="affiliate">
            <AffiliateSettingsPanel />
          </TabsContent>

          <TabsContent value="payouts">
            <PayoutRequestsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
