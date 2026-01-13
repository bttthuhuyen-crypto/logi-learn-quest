import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminMembership, MembershipRequest, MembershipAnswer, MembershipQuestion } from '@/hooks/useMembership';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Check, X, ExternalLink, CheckCheck, XCircle, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

type EnrichedRequest = MembershipRequest & {
  profile?: { full_name: string; avatar_url: string };
  answers?: (MembershipAnswer & { question?: MembershipQuestion })[];
};

const MembershipRequestsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'declined' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkDeclineDialog, setShowBulkDeclineDialog] = useState(false);

  const { requests, loading, fetchRequests, updateRequestStatus } = useAdminMembership();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  // Fetch requests when filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      fetchRequests();
    } else {
      fetchRequests(statusFilter);
    }
  }, [statusFilter]);

  // Filter by search
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true;
    const name = request.profile?.full_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingRequests = filteredRequests.filter((r) => r.status === 'pending');

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    setProcessingIds((prev) => new Set(prev).add(requestId));
    const { error } = await updateRequestStatus(requestId, 'approved', user.id);
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
    if (error) {
      toast.error(language === 'vi' ? 'Không thể duyệt yêu cầu' : 'Failed to approve request');
    } else {
      toast.success(language === 'vi' ? 'Đã duyệt yêu cầu' : 'Request approved');
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!user) return;
    setProcessingIds((prev) => new Set(prev).add(requestId));
    const { error } = await updateRequestStatus(requestId, 'declined', user.id);
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
    if (error) {
      toast.error(language === 'vi' ? 'Không thể từ chối yêu cầu' : 'Failed to decline request');
    } else {
      toast.success(language === 'vi' ? 'Đã từ chối yêu cầu' : 'Request declined');
    }
  };

  const handleBulkApprove = async () => {
    if (!user) return;
    setShowBulkApproveDialog(false);
    
    for (const request of pendingRequests) {
      setProcessingIds((prev) => new Set(prev).add(request.id));
      await updateRequestStatus(request.id, 'approved', user.id);
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
    
    toast.success(
      language === 'vi'
        ? `Đã duyệt ${pendingRequests.length} yêu cầu`
        : `Approved ${pendingRequests.length} requests`
    );
  };

  const handleBulkDecline = async () => {
    if (!user) return;
    setShowBulkDeclineDialog(false);
    
    for (const request of pendingRequests) {
      setProcessingIds((prev) => new Set(prev).add(request.id));
      await updateRequestStatus(request.id, 'declined', user.id);
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
    
    toast.success(
      language === 'vi'
        ? `Đã từ chối ${pendingRequests.length} yêu cầu`
        : `Declined ${pendingRequests.length} requests`
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{language === 'vi' ? 'Đang chờ' : 'Pending'}</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{language === 'vi' ? 'Đã duyệt' : 'Approved'}</Badge>;
      case 'declined':
        return <Badge variant="destructive">{language === 'vi' ? 'Đã từ chối' : 'Declined'}</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: language === 'vi' ? vi : enUS,
    });
  };

  const getQuestionText = (question: MembershipQuestion | undefined) => {
    if (!question) return '';
    if (language === 'en' && question.question_text_en) {
      return question.question_text_en;
    }
    return question.question_text;
  };

  if (authLoading || roleLoading) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <MainLayout>
      <div className="container py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              📥 {language === 'vi' ? 'Yêu cầu tham gia' : 'Membership Requests'}
            </h1>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {pendingCount} {language === 'vi' ? 'đang chờ' : 'pending'}
              </Badge>
            )}
          </div>

          {/* Bulk Actions */}
          {statusFilter === 'pending' && pendingRequests.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => setShowBulkApproveDialog(true)}
              >
                <CheckCheck className="h-4 w-4" />
                {language === 'vi' ? 'Duyệt tất cả' : 'Approve all'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setShowBulkDeclineDialog(true)}
              >
                <XCircle className="h-4 w-4" />
                {language === 'vi' ? 'Từ chối tất cả' : 'Decline all'}
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="pending">{language === 'vi' ? 'Đang chờ' : 'Pending'}</TabsTrigger>
              <TabsTrigger value="approved">{language === 'vi' ? 'Đã duyệt' : 'Approved'}</TabsTrigger>
              <TabsTrigger value="declined">{language === 'vi' ? 'Đã từ chối' : 'Declined'}</TabsTrigger>
              <TabsTrigger value="all">{language === 'vi' ? 'Tất cả' : 'All'}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'vi' ? 'Tìm theo tên...' : 'Search by name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {language === 'vi' ? 'Không có yêu cầu nào' : 'No requests found'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onDecline={handleDecline}
                isProcessing={processingIds.has(request.id)}
                formatTime={formatTime}
                getStatusBadge={getStatusBadge}
                getQuestionText={getQuestionText}
                language={language}
              />
            ))}
          </div>
        )}

        {/* Bulk Approve Dialog */}
        <AlertDialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'vi' ? 'Duyệt tất cả yêu cầu?' : 'Approve all requests?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'vi'
                  ? `Bạn có chắc muốn duyệt tất cả ${pendingRequests.length} yêu cầu đang chờ?`
                  : `Are you sure you want to approve all ${pendingRequests.length} pending requests?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{language === 'vi' ? 'Hủy' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                {language === 'vi' ? 'Duyệt tất cả' : 'Approve all'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Decline Dialog */}
        <AlertDialog open={showBulkDeclineDialog} onOpenChange={setShowBulkDeclineDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'vi' ? 'Từ chối tất cả yêu cầu?' : 'Decline all requests?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'vi'
                  ? `Bạn có chắc muốn từ chối tất cả ${pendingRequests.length} yêu cầu đang chờ?`
                  : `Are you sure you want to decline all ${pendingRequests.length} pending requests?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{language === 'vi' ? 'Hủy' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkDecline} className="bg-destructive hover:bg-destructive/90">
                {language === 'vi' ? 'Từ chối tất cả' : 'Decline all'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

// Request Card Component
interface RequestCardProps {
  request: EnrichedRequest;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  isProcessing: boolean;
  formatTime: (date: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getQuestionText: (question: MembershipQuestion | undefined) => string;
  language: 'vi' | 'en';
}

const RequestCard = ({
  request,
  onApprove,
  onDecline,
  isProcessing,
  formatTime,
  getStatusBadge,
  getQuestionText,
  language,
}: RequestCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-10 w-10 cursor-pointer"
              onClick={() => window.open(`/members/${request.user_id}`, '_blank')}
            >
              <AvatarImage src={request.profile?.avatar_url || undefined} />
              <AvatarFallback>
                {request.profile?.full_name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <button
                className="font-medium hover:underline flex items-center gap-1"
                onClick={() => window.open(`/members/${request.user_id}`, '_blank')}
              >
                {request.profile?.full_name || (language === 'vi' ? 'Người dùng' : 'User')}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </button>
              <p className="text-xs text-muted-foreground">{formatTime(request.created_at)}</p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>

        {/* Q&A */}
        {request.answers && request.answers.length > 0 && (
          <div className="space-y-3 mb-4">
            {request.answers.map((answer, index) => (
              <div key={answer.id} className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {language === 'vi' ? 'Câu hỏi' : 'Question'} {index + 1}: {getQuestionText(answer.question)}
                </p>
                <p className="text-sm">→ "{answer.answer_text}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => onDecline(request.id)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
              {language === 'vi' ? 'Từ chối' : 'Decline'}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(request.id)}
              disabled={isProcessing}
            >
              <Check className="h-4 w-4" />
              {language === 'vi' ? 'Chấp nhận' : 'Approve'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembershipRequestsPage;
