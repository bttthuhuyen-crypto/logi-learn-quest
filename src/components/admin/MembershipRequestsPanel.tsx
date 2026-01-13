import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminMembership } from '@/hooks/useMembership';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Check, X, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export const MembershipRequestsPanel: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { requests, loading, fetchRequests, updateRequestStatus } = useAdminMembership();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchRequests(value === 'all' ? undefined : value as 'pending' | 'approved' | 'declined');
  };

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    setProcessingId(requestId);
    const { error } = await updateRequestStatus(requestId, 'approved', user.id);
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    } else {
      toast.success(language === 'vi' ? 'Đã duyệt thành công' : 'Approved successfully');
    }
    setProcessingId(null);
  };

  const handleDecline = async (requestId: string) => {
    if (!user) return;
    setProcessingId(requestId);
    const { error } = await updateRequestStatus(requestId, 'declined', user.id);
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    } else {
      toast.success(language === 'vi' ? 'Đã từ chối' : 'Declined');
    }
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(request => {
    if (!searchQuery) return true;
    const name = request.profile?.full_name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">{language === 'vi' ? 'Chờ duyệt' : 'Pending'}</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">{language === 'vi' ? 'Đã duyệt' : 'Approved'}</Badge>;
      case 'declined':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">{language === 'vi' ? 'Từ chối' : 'Declined'}</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'vi' ? 'Tìm kiếm theo tên...' : 'Search by name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'vi' ? 'Tất cả' : 'All'}</SelectItem>
            <SelectItem value="pending">{language === 'vi' ? 'Chờ duyệt' : 'Pending'}</SelectItem>
            <SelectItem value="approved">{language === 'vi' ? 'Đã duyệt' : 'Approved'}</SelectItem>
            <SelectItem value="declined">{language === 'vi' ? 'Từ chối' : 'Declined'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              {language === 'vi' ? 'Không có yêu cầu nào' : 'No requests found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.profile?.avatar_url || ''} />
                      <AvatarFallback>
                        {request.profile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.profile?.full_name || 'Unknown User'}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(request.created_at), {
                          addSuffix: true,
                          locale: language === 'vi' ? vi : enUS
                        })}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.answers?.map((answer, index) => (
                  <div key={answer.id} className="border-l-2 border-muted pl-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Q{index + 1}: {answer.question?.question_text || 'Question'}
                    </p>
                    <p className="text-sm mt-1">→ {answer.answer_text}</p>
                  </div>
                ))}

                {request.status === 'pending' && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecline(request.id)}
                      disabled={processingId === request.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          {language === 'vi' ? 'Từ chối' : 'Decline'}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          {language === 'vi' ? 'Duyệt' : 'Approve'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
