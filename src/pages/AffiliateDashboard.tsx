import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAffiliateBalance } from '@/hooks/useAffiliateBalance';
import { useAffiliateReferrals } from '@/hooks/useAffiliateReferrals';
import { usePayoutRequests } from '@/hooks/usePayoutRequests';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';
import { useAffiliateSettings } from '@/hooks/useAffiliateSettings';
import { ReferralLinkCard } from '@/components/affiliate/ReferralLinkCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Banknote,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AffiliateDashboard = () => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { balance, totalEarned, pendingAmount, availableAmount, totalWithdrawn, isLoading: balanceLoading } = useAffiliateBalance();
  const { referrals, isLoading: referralsLoading } = useAffiliateReferrals();
  const { payoutRequests, createPayout, isCreating, isLoading: payoutsLoading } = usePayoutRequests();
  const { stats: linkStats } = useAffiliateLink();
  const { settings } = useAffiliateSettings();

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    bank_branch: '',
  });

  // Redirect if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = balanceLoading || referralsLoading || payoutsLoading;

  const handlePayoutSubmit = async () => {
    const amount = parseInt(payoutForm.amount);
    
    if (!amount || amount < (settings?.min_payout_amount || 100000)) {
      return;
    }

    if (amount > availableAmount) {
      return;
    }

    await createPayout({
      amount,
      bank_name: payoutForm.bank_name,
      bank_account_number: payoutForm.bank_account_number,
      bank_account_name: payoutForm.bank_account_name,
      bank_branch: payoutForm.bank_branch,
    });

    setPayoutModalOpen(false);
    setPayoutForm({
      amount: '',
      bank_name: '',
      bank_account_number: '',
      bank_account_name: '',
      bank_branch: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      paid: 'default',
      reversed: 'destructive',
      processing: 'secondary',
      completed: 'default',
      rejected: 'destructive',
    };

    const statusLabels: Record<string, string> = {
      pending: t.status.pending,
      confirmed: t.status.confirmed,
      paid: t.status.paid,
      reversed: t.status.reversed,
      processing: t.status.processing,
      completed: t.status.completed,
      rejected: t.status.rejected,
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t.affiliate.dashboardTitle}</h1>
          <p className="text-muted-foreground mt-1">{t.affiliate.shareAndEarn}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.affiliate.totalEarnings}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(totalEarned)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.affiliate.pendingAmount}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(pendingAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.affiliate.availableAmount}
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(availableAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.affiliate.totalWithdrawn}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalWithdrawn)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Link Card */}
            <div className="mb-8">
              <ReferralLinkCard />
            </div>

            {/* Withdraw Button */}
            <div className="mb-8">
              <Button
                size="lg"
                onClick={() => setPayoutModalOpen(true)}
                disabled={availableAmount < (settings?.min_payout_amount || 100000)}
                className="gap-2"
              >
                <Banknote className="h-5 w-5" />
                {t.affiliate.withdrawTitle}
              </Button>
              {availableAmount < (settings?.min_payout_amount || 100000) && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {t.affiliate.minimumAmount}: {formatCurrency(settings?.min_payout_amount || 100000)}
                </p>
              )}
            </div>

            {/* Tabs for Transaction History and Payout History */}
            <Tabs defaultValue="referrals" className="space-y-4">
              <TabsList>
                <TabsTrigger value="referrals">{t.affiliate.transactionHistory}</TabsTrigger>
                <TabsTrigger value="payouts">{t.affiliate.payoutRequests}</TabsTrigger>
              </TabsList>

              <TabsContent value="referrals">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.affiliate.transactionHistory}</CardTitle>
                    <CardDescription>
                      {t.affiliate.referrals}: {referrals.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {referrals.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {t.common.none}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t.leaderboard.member}</TableHead>
                            <TableHead>{t.classroom.courseName}</TableHead>
                            <TableHead>{t.affiliate.commissionRate}</TableHead>
                            <TableHead>{t.affiliate.totalEarnings}</TableHead>
                            <TableHead>{t.status.pending}</TableHead>
                            <TableHead>{t.calendar.eventDate}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referrals.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell className="font-medium">
                                {referral.referred_user?.full_name || 'Unknown'}
                              </TableCell>
                              <TableCell>
                                {referral.course?.title || '-'}
                              </TableCell>
                              <TableCell>{referral.commission_rate}%</TableCell>
                              <TableCell className="text-green-600 font-medium">
                                +{formatCurrency(referral.commission_amount)}
                              </TableCell>
                              <TableCell>{getStatusBadge(referral.status)}</TableCell>
                              <TableCell>{formatDate(referral.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payouts">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.affiliate.payoutRequests}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payoutRequests.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {t.common.none}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t.affiliate.totalEarnings}</TableHead>
                            <TableHead>{t.affiliate.bankName}</TableHead>
                            <TableHead>{t.affiliate.accountNumber}</TableHead>
                            <TableHead>{t.status.pending}</TableHead>
                            <TableHead>{t.calendar.eventDate}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payoutRequests.map((payout) => (
                            <TableRow key={payout.id}>
                              <TableCell className="font-medium">
                                {formatCurrency(payout.amount)}
                              </TableCell>
                              <TableCell>{payout.bank_name}</TableCell>
                              <TableCell>{payout.bank_account_number}</TableCell>
                              <TableCell>{getStatusBadge(payout.status)}</TableCell>
                              <TableCell>{formatDate(payout.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Payout Modal */}
      <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              {t.affiliate.withdrawTitle}
            </DialogTitle>
            <DialogDescription>
              {t.affiliate.availableAmount}: {formatCurrency(availableAmount)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.affiliate.totalEarnings}</Label>
              <Input
                type="number"
                placeholder={formatCurrency(settings?.min_payout_amount || 100000)}
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
              />
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => setPayoutForm({ ...payoutForm, amount: String(availableAmount) })}
              >
                {t.affiliate.withdrawAll}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t.affiliate.bankName}</Label>
              <Input
                placeholder="Vietcombank, Techcombank, ..."
                value={payoutForm.bank_name}
                onChange={(e) => setPayoutForm({ ...payoutForm, bank_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.affiliate.accountNumber}</Label>
              <Input
                placeholder="0123456789"
                value={payoutForm.bank_account_number}
                onChange={(e) => setPayoutForm({ ...payoutForm, bank_account_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.affiliate.accountName}</Label>
              <Input
                placeholder="NGUYEN VAN A"
                value={payoutForm.bank_account_name}
                onChange={(e) => setPayoutForm({ ...payoutForm, bank_account_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.affiliate.branchName} ({t.common.none})</Label>
              <Input
                placeholder="TP. Hồ Chí Minh"
                value={payoutForm.bank_branch}
                onChange={(e) => setPayoutForm({ ...payoutForm, bank_branch: e.target.value })}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {t.affiliate.payoutNote}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={handlePayoutSubmit}
              disabled={
                isCreating ||
                !payoutForm.amount ||
                !payoutForm.bank_name ||
                !payoutForm.bank_account_number ||
                !payoutForm.bank_account_name ||
                parseInt(payoutForm.amount) < (settings?.min_payout_amount || 100000) ||
                parseInt(payoutForm.amount) > availableAmount
              }
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.affiliate.confirmWithdraw}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AffiliateDashboard;
