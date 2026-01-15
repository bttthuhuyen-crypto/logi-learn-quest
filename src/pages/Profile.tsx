import React, { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Camera, 
  Loader2, 
  Star, 
  Save,
  X,
  Settings,
  Award,
} from 'lucide-react';
import { MyProgressCard } from '@/components/leaderboard/MyProgressCard';
import { BadgesCard } from '@/components/gamification/BadgesCard';
import { ActivityHeatmap } from '@/components/members/ActivityHeatmap';
import { MemberActivityFeed } from '@/components/members/MemberActivityFeed';
import { MemberPostsTab } from '@/components/members/MemberPostsTab';
import { MemberCommentsTab } from '@/components/members/MemberCommentsTab';
import { useMyProgress } from '@/hooks/useMyProgress';
import { useMemberActivities, useMemberActivityHeatmap } from '@/hooks/useMemberActivities';
import { LevelBadge } from '@/components/community/LevelBadge';

const Profile = () => {
  const navigate = useNavigate();
  const { language, t, formatDate } = useLanguage();
  const { user, profile, loading, refreshProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch progress data
  const { data: myProgress, isLoading: isProgressLoading } = useMyProgress();
  
  // Fetch activities
  const { 
    data: activitiesData, 
    isLoading: isActivitiesLoading,
    hasNextPage,
    fetchNextPage,
  } = useMemberActivities(user?.id);

  // Fetch heatmap data
  const { data: heatmapData, isLoading: isHeatmapLoading } = useMemberActivityHeatmap(user?.id);

  const activities = activitiesData?.pages.flatMap(page => page.data) || [];

  // Update local state when profile changes
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

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

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'vi' ? 'Vui lòng chọn file ảnh' : 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'vi' ? 'File không được quá 5MB' : 'File must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success(language === 'vi' ? 'Đã cập nhật ảnh đại diện' : 'Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t.errors.somethingWentWrong);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error(t.errors.required);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          bio: bio.trim() || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      toast.success(t.admin.settingsSaved);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t.errors.somethingWentWrong);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setBio(profile?.bio || '');
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8">
        {/* Left Column: Profile Info & Tabs (8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Avatar */}
                <div className="relative group mx-auto sm:mx-0">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -right-1">
                    <LevelBadge level={profile?.level || 1} size="md" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-xs">{t.auth.fullName}</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t.auth.fullName}
                          maxLength={100}
                          className="max-w-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bio" className="text-xs">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={language === 'vi' ? 'Giới thiệu về bản thân...' : 'Tell us about yourself...'}
                          rows={2}
                          maxLength={500}
                          className="max-w-md"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                          {isSaving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                          <Save className="mr-1 h-3 w-3" />
                          {t.common.save}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
                          <X className="mr-1 h-3 w-3" />
                          {t.common.cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h2 className="text-xl font-bold">{profile?.full_name || 'User'}</h2>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => setIsEditing(true)}
                        >
                          {t.common.edit}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {profile?.bio && (
                        <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{profile.bio}</p>
                      )}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Level {profile?.level || 1}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {profile?.points || 0} {t.common.points}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {/* Settings Button */}
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/settings')}
                    className="hidden sm:flex"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {language === 'vi' ? 'Cài đặt' : 'Settings'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section - Skool Style */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-8">
              {["activity", "posts", "comments"].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab}
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 pt-0 capitalize text-muted-foreground data-[state=active]:text-foreground font-medium"
                >
                  {tab === 'activity' ? (language === 'vi' ? 'Hoạt động' : 'Activity') : 
                   tab === 'posts' ? (language === 'vi' ? 'Bài viết' : 'Posts') : 
                   (language === 'vi' ? 'Bình luận' : 'Comments')}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <MemberActivityFeed 
                activities={activities}
                isLoading={isActivitiesLoading}
                hasMore={hasNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <MemberPostsTab userId={user.id} />
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <MemberCommentsTab userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Gamification (4 columns) - LINH HỒN CỦA SKOOL */}
        <div className="lg:col-span-4 space-y-6">
          {/* My Progress Card - Compact */}
          <MyProgressCard 
            progress={myProgress} 
            isLoading={isProgressLoading}
            variant="compact"
          />

          {/* Badges Card - Custom Title */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4" />
                {language === 'vi' ? 'Huy hiệu Logistics đạt được' : 'Logistics Badges Earned'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: Math.min(profile?.level || 1, 8) }, (_, i) => (
                  <LevelBadge key={i + 1} level={i + 1} size="md" />
                ))}
              </div>
              {(!profile?.level || profile.level === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === 'vi' ? 'Chưa có huy hiệu nào' : 'No badges yet'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Heatmap */}
          <ActivityHeatmap activities={heatmapData || []} isLoading={isHeatmapLoading} />

          {/* Account Info - Mobile settings button */}
          <Card className="lg:hidden">
            <CardContent className="pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                {language === 'vi' ? 'Cài đặt' : 'Settings'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
