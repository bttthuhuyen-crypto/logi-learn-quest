import { Suspense, lazy } from "react";
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
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";
// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Admin = lazy(() => import("./pages/Admin"));
const MembershipRequestsPage = lazy(() => import("./pages/MembershipRequestsPage"));
const Classroom = lazy(() => import("./pages/Classroom"));
const CourseEditor = lazy(() => import("./pages/CourseEditor"));
const Community = lazy(() => import("./pages/Community"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Calendar = lazy(() => import("./pages/Calendar"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Members = lazy(() => import("./pages/Members"));
const MemberProfile = lazy(() => import("./pages/MemberProfile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const About = lazy(() => import("./pages/About"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Messenger = lazy(() => import("./pages/Messenger"));
const MapPage = lazy(() => import("./pages/Map"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));

// Lazy load settings components
const SettingsProfile = lazy(() => import("@/components/settings/SettingsProfile").then(m => ({ default: m.SettingsProfile })));
const SettingsNotifications = lazy(() => import("@/components/settings/SettingsNotifications").then(m => ({ default: m.SettingsNotifications })));
const SettingsPayment = lazy(() => import("@/components/settings/SettingsPayment").then(m => ({ default: m.SettingsPayment })));
const SettingsOrders = lazy(() => import("@/components/settings/SettingsOrders").then(m => ({ default: m.SettingsOrders })));
const SettingsAffiliate = lazy(() => import("@/components/settings/SettingsAffiliate").then(m => ({ default: m.SettingsAffiliate })));
const SettingsSecurity = lazy(() => import("@/components/settings/SettingsSecurity").then(m => ({ default: m.SettingsSecurity })));
const AdminGeneralSettings = lazy(() => import("@/components/settings/admin/AdminGeneralSettings").then(m => ({ default: m.AdminGeneralSettings })));
const AdminCategories = lazy(() => import("@/components/settings/admin/AdminCategories").then(m => ({ default: m.AdminCategories })));
const AdminPlugins = lazy(() => import("@/components/settings/admin/AdminPlugins").then(m => ({ default: m.AdminPlugins })));
const AdminCommission = lazy(() => import("@/components/settings/admin/AdminCommission").then(m => ({ default: m.AdminCommission })));
const AdminPayments = lazy(() => import("@/components/settings/admin/AdminPayments").then(m => ({ default: m.AdminPayments })));
const AdminAnalytics = lazy(() => import("@/components/settings/admin/AdminAnalytics").then(m => ({ default: m.AdminAnalytics })));
const AdminGamification = lazy(() => import("@/components/settings/admin/AdminGamification").then(m => ({ default: m.AdminGamification })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Optimized QueryClient with caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (>= staleTime)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry once on failure
      refetchOnMount: false, // Don't refetch on component mount if data exists
    },
  },
});

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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
                      <Route path="/admin/membership-requests" element={<ProtectedAdminRoute><MembershipRequestsPage /></ProtectedAdminRoute>} />
                      <Route path="/classroom" element={<Classroom />} />
                      <Route path="/classroom/edit/:id" element={<ProtectedAdminRoute><CourseEditor /></ProtectedAdminRoute>} />
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
                        <Route path="admin/general" element={<ProtectedAdminRoute><AdminGeneralSettings /></ProtectedAdminRoute>} />
                        <Route path="admin/categories" element={<ProtectedAdminRoute><AdminCategories /></ProtectedAdminRoute>} />
                        <Route path="admin/plugins" element={<ProtectedAdminRoute><AdminPlugins /></ProtectedAdminRoute>} />
                        <Route path="admin/commission" element={<ProtectedAdminRoute><AdminCommission /></ProtectedAdminRoute>} />
                        <Route path="admin/payments" element={<ProtectedAdminRoute><AdminPayments /></ProtectedAdminRoute>} />
                        <Route path="admin/analytics" element={<ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
                        <Route path="admin/gamification" element={<ProtectedAdminRoute><AdminGamification /></ProtectedAdminRoute>} />
                      </Route>
                      {/* Legacy redirects */}
                      <Route path="/profile" element={<Navigate to="/settings/profile" replace />} />
                      <Route path="/affiliate" element={<Navigate to="/settings/affiliate" replace />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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
