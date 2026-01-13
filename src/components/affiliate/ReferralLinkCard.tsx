import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Facebook, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ReferralLinkCard = () => {
  const { t } = useLanguage();
  const { referralUrl, referralCode, stats, isLoading } = useAffiliateLink();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success(t.affiliate.linkCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t.errors.somethingWentWrong);
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareZalo = () => {
    const url = `https://zalo.me/share?url=${encodeURIComponent(referralUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-48" />
          <div className="h-4 bg-muted animate-pulse rounded w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          {t.affiliate.shareAndEarn}
        </CardTitle>
        <CardDescription>
          {t.affiliate.earnCommission}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t.affiliate.yourLink}
          </label>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {t.affiliate.copyLink}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareFacebook}
            className="gap-2"
          >
            <Facebook className="h-4 w-4" />
            {t.affiliate.shareToFacebook}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareZalo}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {t.affiliate.shareToZalo}
          </Button>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total_clicks}</p>
              <p className="text-xs text-muted-foreground">{t.affiliate.clicks}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total_signups}</p>
              <p className="text-xs text-muted-foreground">{t.affiliate.signups}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total_purchases}</p>
              <p className="text-xs text-muted-foreground">{t.affiliate.purchases}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
