import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdminPayoutRequests } from '@/hooks/useAdminPayoutRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  DollarSign,
  Building2,
  CreditCard,
  User,
  AlertCircle,
} from 'lucide-react';

export const PayoutRequestsPanel = () => {
  const { language, t, formatCurrency, formatDateTime } = useLanguage();
  const { 
    payoutRequests, 
    stats, 
    isLoading, 
    updateStatus,
    isUpdating 
  } = useAdminPayoutRequests();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<typeof payoutRequests[0] | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | 'view'; request: typeof payoutRequests[0] } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredRequests = statusFilter === 'all' 
    ? payoutRequests 
    : payoutRequests.filter(r => r.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      processing: { variant: 'outline', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      completed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.pending;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {t.status[status as keyof typeof t.status] || status}
      </Badge>
    );
  };

  const handleApprove = async (status: 'processing' | 'completed') => {
    if (!actionModal?.request) return;
    
    await updateStatus({
      requestId: actionModal.request.id,
      status,
    });
    setActionModal(null);
  };

  const handleReject = async () => {
    if (!actionModal?.request) return;
    
    await updateStatus({
      requestId: actionModal.request.id,
      status: 'rejected',
      rejectionReason,
    });
    setActionModal(null);
    setRejectionReason('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Đang chờ' : 'Pending'}
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Đang xử lý' : 'Processing'}
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Hoàn thành' : 'Completed'}
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Tổng yêu cầu' : 'Total Requested'}
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrency(stats.pendingAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {t.affiliate.payoutRequests}
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.common.filter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.all}</SelectItem>
                <SelectItem value="pending">{t.status.pending}</SelectItem>
                <SelectItem value="processing">{t.status.processing}</SelectItem>
                <SelectItem value="completed">{t.status.completed}</SelectItem>
                <SelectItem value="rejected">{t.status.rejected}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'vi' ? 'Không có yêu cầu nào' : 'No requests found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'vi' ? 'Người yêu cầu' : 'Requester'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Số tiền' : 'Amount'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Ngân hàng' : 'Bank'}</TableHead>
                  <TableHead>{language === 'vi' ? 'Thời gian' : 'Date'}</TableHead>
                  <TableHead>{t.status.pending}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.profile?.avatar_url || ''} />
                          <AvatarFallback>
                            {request.profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {request.profile?.full_name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatCurrency(request.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{request.bank_name}</div>
                        <div className="text-muted-foreground">{request.bank_account_number}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(new Date(request.created_at))}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionModal({ type: 'view', request })}
                        >
                          {t.common.details}
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setActionModal({ type: 'approve', request })}
                            >
                              {t.membership.approve}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setActionModal({ type: 'reject', request })}
                            >
                              {t.membership.decline}
                            </Button>
                          </>
                        )}
                        {request.status === 'processing' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setActionModal({ type: 'approve', request })}
                          >
                            {language === 'vi' ? 'Đánh dấu hoàn thành' : 'Mark Complete'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details / Approve Modal */}
      <Dialog open={actionModal?.type === 'view' || actionModal?.type === 'approve'} onOpenChange={() => setActionModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionModal?.type === 'view' 
                ? (language === 'vi' ? 'Chi tiết yêu cầu' : 'Request Details')
                : (language === 'vi' ? 'Duyệt yêu cầu rút tiền' : 'Approve Payout Request')
              }
            </DialogTitle>
          </DialogHeader>

          {actionModal?.request && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={actionModal.request.profile?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{actionModal.request.profile?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(new Date(actionModal.request.created_at))}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'vi' ? 'Số tiền yêu cầu' : 'Requested Amount'}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(actionModal.request.amount)}
                </p>
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.affiliate.bankName}</p>
                    <p className="font-medium">{actionModal.request.bank_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.affiliate.accountNumber}</p>
                    <p className="font-medium font-mono">{actionModal.request.bank_account_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.affiliate.accountName}</p>
                    <p className="font-medium">{actionModal.request.bank_account_name}</p>
                  </div>
                </div>
                {actionModal.request.bank_branch && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.affiliate.branchName}</p>
                      <p className="font-medium">{actionModal.request.bank_branch}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-muted-foreground">{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
                {getStatusBadge(actionModal.request.status)}
              </div>

              {/* Rejection Reason */}
              {actionModal.request.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {language === 'vi' ? 'Lý do từ chối' : 'Rejection Reason'}
                    </span>
                  </div>
                  <p className="text-sm">{actionModal.request.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {actionModal?.type === 'approve' && actionModal.request.status === 'pending' && (
              <>
                <Button variant="outline" onClick={() => setActionModal(null)}>
                  {t.common.cancel}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handleApprove('processing')}
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'vi' ? 'Đang xử lý' : 'Mark Processing'}
                </Button>
                <Button 
                  onClick={() => handleApprove('completed')}
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'vi' ? 'Hoàn thành' : 'Mark Complete'}
                </Button>
              </>
            )}
            {actionModal?.type === 'approve' && actionModal.request.status === 'processing' && (
              <>
                <Button variant="outline" onClick={() => setActionModal(null)}>
                  {t.common.cancel}
                </Button>
                <Button 
                  onClick={() => handleApprove('completed')}
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'vi' ? 'Hoàn thành' : 'Mark Complete'}
                </Button>
              </>
            )}
            {actionModal?.type === 'view' && (
              <Button variant="outline" onClick={() => setActionModal(null)}>
                {t.common.close}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={actionModal?.type === 'reject'} onOpenChange={() => { setActionModal(null); setRejectionReason(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Từ chối yêu cầu rút tiền' : 'Reject Payout Request'}
            </DialogTitle>
            <DialogDescription>
              {language === 'vi' 
                ? 'Vui lòng cung cấp lý do từ chối. Người dùng sẽ nhận được thông báo này.'
                : 'Please provide a reason for rejection. The user will be notified.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Lý do từ chối' : 'Rejection Reason'}</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={language === 'vi' ? 'Nhập lý do từ chối...' : 'Enter rejection reason...'}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionModal(null); setRejectionReason(''); }}>
              {t.common.cancel}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isUpdating || !rejectionReason.trim()}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.membership.decline}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
