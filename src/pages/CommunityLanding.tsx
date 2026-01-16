import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Users, Globe, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCommunity } from '@/contexts/CommunityContext';
import { useCommunityMembership } from '@/hooks/useCommunityMembership';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function CommunityLanding() {
  const navigate = useNavigate();
  const { community, isLoading } = useCommunity();
  const { user } = useAuth();
  const { data: membership, isLoading: membershipLoading } = useCommunityMembership(community?.id || null);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!community) return;

    setIsJoining(true);
    try {
      if (community.requires_approval) {
        // Create membership request
        const { error } = await supabase
          .from('membership_requests')
          .insert({
            community_id: community.id,
            user_id: user.id,
            status: 'pending',
          });

        if (error) throw error;
        toast.success('Yêu cầu tham gia đã được gửi!');
      } else {
        // Direct join for free communities
        const { error } = await supabase
          .from('community_members')
          .insert({
            community_id: community.id,
            user_id: user.id,
            role: 'member',
            status: 'active',
          });

        if (error) throw error;
        toast.success('Chào mừng bạn đến với cộng đồng!');
        navigate(`/c/${community.slug}`);
      }
    } catch (error: any) {
      console.error('Join error:', error);
      toast.error(error.message || 'Không thể tham gia cộng đồng');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <Skeleton className="h-64 w-full" />
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!community) {
    return null;
  }

  const formatPrice = () => {
    if (!community.price || community.price === 0) {
      return 'Miễn phí';
    }
    const period = community.price_period === 'monthly' ? '/tháng' : '/năm';
    return `${community.price.toLocaleString('vi-VN')}đ${period}`;
  };

  const memberCount = community.member_count || 0;
  const formatMemberCount = () => {
    if (memberCount >= 1000) {
      return `${(memberCount / 1000).toFixed(1)}k`;
    }
    return memberCount.toString();
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section with Cover Image */}
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5">
          {community.cover_image_url && (
            <img
              src={community.cover_image_url}
              alt={community.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Community Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={community.logo_url || undefined} alt={community.name} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {community.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-6">
                  <h1 className="text-2xl md:text-3xl font-bold">{community.name}</h1>
                  <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                    <Badge variant="secondary" className="gap-1">
                      {community.is_public ? (
                        <>
                          <Globe className="h-3 w-3" />
                          Công khai
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          Riêng tư
                        </>
                      )}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatMemberCount()} thành viên
                    </span>
                    <span className="font-medium text-primary">{formatPrice()}</span>
                  </div>
                </div>
              </div>

              {/* Video/Preview Section */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {community.cover_image_url ? (
                    <img
                      src={community.cover_image_url}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Play className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Video giới thiệu</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Description */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Giới thiệu</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {community.description ? (
                    <p className="whitespace-pre-wrap">{community.description}</p>
                  ) : (
                    <p>Chưa có mô tả cho cộng đồng này.</p>
                  )}
                </div>
              </Card>

              {/* Features/Benefits */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Bạn sẽ nhận được</h2>
                <ul className="space-y-3">
                  {[
                    'Truy cập tất cả bài viết và thảo luận',
                    'Tham gia các sự kiện độc quyền',
                    'Kết nối với cộng đồng thành viên',
                    'Học hỏi từ các chuyên gia trong lĩnh vực',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Sidebar - Join Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="text-center space-y-4">
                  <Avatar className="h-20 w-20 mx-auto">
                    <AvatarImage src={community.logo_url || undefined} alt={community.name} />
                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                      {community.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{community.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatMemberCount()} thành viên
                    </p>
                  </div>

                  <div className="text-2xl font-bold text-primary">
                    {formatPrice()}
                  </div>

                  {membershipLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : membership?.isPending ? (
                    <Button disabled className="w-full h-12 text-base">
                      Đang chờ duyệt
                    </Button>
                  ) : membership?.isMember ? (
                    <Button 
                      className="w-full h-12 text-base"
                      onClick={() => navigate(`/c/${community.slug}`)}
                    >
                      Vào cộng đồng
                    </Button>
                  ) : (
                    <Button 
                      className="w-full h-12 text-base"
                      onClick={handleJoin}
                      disabled={isJoining}
                    >
                      {isJoining ? 'Đang xử lý...' : community.requires_approval ? 'Yêu cầu tham gia' : 'Tham gia ngay'}
                    </Button>
                  )}

                  {community.requires_approval && !membership?.isMember && !membership?.isPending && (
                    <p className="text-xs text-muted-foreground">
                      Cộng đồng này yêu cầu phê duyệt để tham gia
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
