import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReferralTracker } from "@/components/affiliate/ReferralTracker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Classroom from "./pages/Classroom";
import CourseEditor from "./pages/CourseEditor";
import Community from "./pages/Community";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import Profile from "./pages/Profile";
import NotificationSettings from "./pages/NotificationSettings";
import Notifications from "./pages/Notifications";
import Messenger from "./pages/Messenger";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ReferralTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/classroom" element={<Classroom />} />
              <Route path="/classroom/edit/:id" element={<CourseEditor />} />
              <Route path="/classroom/:id" element={<CourseEditor />} />
              <Route path="/community" element={<Community />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/members" element={<Members />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/affiliate" element={<AffiliateDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/messages" element={<Messenger />} />
              <Route path="/messages/:conversationId" element={<Messenger />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
