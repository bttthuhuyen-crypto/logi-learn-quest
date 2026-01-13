import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { MembershipQuestionsModal } from '@/components/membership/MembershipQuestionsModal';
import { PendingApprovalBanner } from '@/components/membership/PendingApprovalBanner';
import { ArrowRight, BookOpen, Users, Trophy, Calendar } from 'lucide-react';

const Index = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { userRequest, questionsEnabled, refetch } = useMembership();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const features = [
    {
      icon: BookOpen,
      title: 'Học tập',
      titleEn: 'Learn',
      description: 'Khóa học chất lượng cao về logistics',
      descriptionEn: 'High-quality logistics courses',
    },
    {
      icon: Users,
      title: 'Cộng đồng',
      titleEn: 'Community',
      description: 'Kết nối với chuyên gia trong ngành',
      descriptionEn: 'Connect with industry experts',
    },
    {
      icon: Trophy,
      title: 'Thành tựu',
      titleEn: 'Achievement',
      description: 'Nhận điểm và lên cấp khi hoạt động',
      descriptionEn: 'Earn points and level up',
    },
    {
      icon: Calendar,
      title: 'Sự kiện',
      titleEn: 'Events',
      description: 'Webinar và meetup định kỳ',
      descriptionEn: 'Regular webinars and meetups',
    },
  ];

  // Determine if user needs to join (logged in but no request or not approved)
  const needsToJoin = user && questionsEnabled && !userRequest;
  const isPending = user && userRequest?.status === 'pending';
  const isDeclined = user && userRequest?.status === 'declined';
  const isApproved = user && userRequest?.status === 'approved';

  const handleJoinClick = () => {
    if (!user) {
      // Redirect to auth if not logged in
      window.location.href = '/auth';
    } else {
      setJoinModalOpen(true);
    }
  };

  return (
    <MainLayout>
      {/* Membership Status Banner */}
      {user && userRequest && (userRequest.status === 'pending' || userRequest.status === 'declined') && (
        <div className="container px-4 mx-auto mt-4">
          <PendingApprovalBanner status={userRequest.status} />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t.welcome.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t.welcome.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isApproved ? (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/classroom">
                    {t.nav.classroom}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : needsToJoin ? (
                <Button size="lg" className="gap-2" onClick={handleJoinClick}>
                  {language === 'vi' ? 'Tham gia cộng đồng' : 'Join Community'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : isPending || isDeclined ? (
                <Button size="lg" className="gap-2" disabled>
                  {language === 'vi' ? 'Đang chờ duyệt' : 'Pending Approval'}
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/auth">
                      {t.welcome.getStarted}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/about">{t.nav.about}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t.welcome.title.includes('Chào') ? feature.title : feature.titleEn}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t.welcome.title.includes('Chào') ? feature.description : feature.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t.welcome.title.includes('Chào') 
                ? 'Sẵn sàng bắt đầu?' 
                : 'Ready to get started?'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t.welcome.title.includes('Chào')
                ? 'Tham gia cộng đồng 10X Logistics ngay hôm nay'
                : 'Join the 10X Logistics community today'}
            </p>
            {!user && (
              <Button asChild size="lg">
                <Link to="/auth">{t.welcome.getStarted}</Link>
              </Button>
            )}
            {needsToJoin && (
              <Button size="lg" onClick={handleJoinClick}>
                {language === 'vi' ? 'Tham gia ngay' : 'Join Now'}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Membership Questions Modal */}
      <MembershipQuestionsModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        onSuccess={refetch}
      />
    </MainLayout>
  );
};

export default Index;
