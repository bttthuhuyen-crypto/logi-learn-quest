import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PresenceProvider } from "@/contexts/PresenceContext";
import { LevelUpCelebrationProvider } from "@/contexts/LevelUpCelebrationContext";
import { ReferralTracker } from "@/components/affiliate/ReferralTracker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Admin from "./pages/Admin";
import MembershipRequestsPage from "./pages/MembershipRequestsPage";
import Classroom from "./pages/Classroom";
import CourseEditor from "./pages/CourseEditor";
import Community from "./pages/Community";
import PostDetail from "./pages/PostDetail";
import Calendar from "./pages/Calendar";
import EventDetail from "./pages/EventDetail";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import Messenger from "./pages/Messenger";
import MapPage from "./pages/Map";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { SettingsNotifications } from "@/components/settings/SettingsNotifications";
import { SettingsPayment } from "@/components/settings/SettingsPayment";
import { SettingsOrders } from "@/components/settings/SettingsOrders";
import { SettingsAffiliate } from "@/components/settings/SettingsAffiliate";
import { SettingsSecurity } from "@/components/settings/SettingsSecurity";
import { AdminGeneralSettings } from "@/components/settings/admin/AdminGeneralSettings";
import { AdminCategories } from "@/components/settings/admin/AdminCategories";
import { AdminPlugins } from "@/components/settings/admin/AdminPlugins";
import { AdminCommission } from "@/components/settings/admin/AdminCommission";
import { AdminPayments } from "@/components/settings/admin/AdminPayments";
import { AdminAnalytics } from "@/components/settings/admin/AdminAnalytics";
import { AdminGamification } from "@/components/settings/admin/AdminGamification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <PresenceProvider>
            <LevelUpCelebrationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ReferralTracker />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/membership-requests" element={<MembershipRequestsPage />} />
                  <Route path="/classroom" element={<Classroom />} />
                  <Route path="/classroom/edit/:id" element={<CourseEditor />} />
                  <Route path="/classroom/:id" element={<CourseEditor />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/community/post/:postId" element={<PostDetail />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/calendar/event/:eventId" element={<EventDetail />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/members/:userId" element={<MemberProfile />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/messages" element={<Messenger />} />
                  <Route path="/messages/:conversationId" element={<Messenger />} />
                  {/* Settings Routes */}
                  <Route path="/settings" element={<Settings />}>
                    <Route index element={<Navigate to="/settings/profile" replace />} />
                    <Route path="profile" element={<SettingsProfile />} />
                    <Route path="notifications" element={<SettingsNotifications />} />
                    <Route path="payment" element={<SettingsPayment />} />
                    <Route path="orders" element={<SettingsOrders />} />
                    <Route path="affiliate" element={<SettingsAffiliate />} />
                    <Route path="security" element={<SettingsSecurity />} />
                    <Route path="admin/general" element={<AdminGeneralSettings />} />
                    <Route path="admin/categories" element={<AdminCategories />} />
                    <Route path="admin/plugins" element={<AdminPlugins />} />
                    <Route path="admin/commission" element={<AdminCommission />} />
                    <Route path="admin/payments" element={<AdminPayments />} />
                    <Route path="admin/analytics" element={<AdminAnalytics />} />
                    <Route path="admin/gamification" element={<AdminGamification />} />
                  </Route>
                  {/* Legacy redirects */}
                  <Route path="/profile" element={<Navigate to="/settings/profile" replace />} />
                  <Route path="/affiliate" element={<Navigate to="/settings/affiliate" replace />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </LevelUpCelebrationProvider>
          </PresenceProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
