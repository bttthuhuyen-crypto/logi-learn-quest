import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Link2, Copy, Trash2, Loader2, Check, ExternalLink } from 'lucide-react';
import { useInviteLinks } from '@/hooks/useInviteLinks';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

export const InviteLinkTab = () => {
  const { toast } = useToast();
  const { inviteLinks, isLoading, createInviteLink, revokeInviteLink, getInviteLinkUrl } = useInviteLinks();
  
  const [expiresIn, setExpiresIn] = useState<'24h' | '7d' | '30d' | 'never'>('7d');
  const [maxUses, setMaxUses] = useState<string>('unlimited');
  const [role, setRole] = useState('member');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    await createInviteLink.mutateAsync({
      expiresIn,
      maxUses: maxUses === 'unlimited' ? null : parseInt(maxUses),
      role,
    });
  };

  const handleCopyLink = async (code: string, id: string) => {
    const url = getInviteLinkUrl(code);
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({
      title: 'Đã sao chép',
      description: 'Link mời đã được sao chép vào clipboard.',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeLink = async () => {
    if (!selectedLinkId) return;
    await revokeInviteLink.mutateAsync(selectedLinkId);
    setRevokeDialogOpen(false);
    setSelectedLinkId(null);
  };

  const getExpiryStatus = (expiresAt: string | null, isRevoked: boolean) => {
    if (isRevoked) return { label: 'Đã thu hồi', variant: 'destructive' as const };
    if (!expiresAt) return { label: 'Không hết hạn', variant: 'secondary' as const };
    
    const expiry = new Date(expiresAt);
    if (expiry < new Date()) return { label: 'Đã hết hạn', variant: 'outline' as const };
    
    return { 
      label: `Còn ${formatDistanceToNow(expiry, { locale: vi })}`, 
      variant: 'default' as const 
    };
  };

  const activeLinks = inviteLinks?.filter(l => !l.is_revoked && (!l.expires_at || new Date(l.expires_at) > new Date())) || [];

  return (
    <div className="space-y-6">
      {/* Generate New Link */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium">Tạo link mời mới</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Thời hạn</Label>
            <Select value={expiresIn} onValueChange={(v) => setExpiresIn(v as typeof expiresIn)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 giờ</SelectItem>
                <SelectItem value="7d">7 ngày</SelectItem>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="never">Không hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Giới hạn sử dụng</Label>
            <Select value={maxUses} onValueChange={setMaxUses}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unlimited">Không giới hạn</SelectItem>
                <SelectItem value="10">10 lần</SelectItem>
                <SelectItem value="50">50 lần</SelectItem>
                <SelectItem value="100">100 lần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Vai trò mặc định</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Thành viên</SelectItem>
              <SelectItem value="moderator">Điều hành viên</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleGenerateLink} 
          disabled={createInviteLink.isPending}
          className="w-full"
        >
          {createInviteLink.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          Tạo link mời
        </Button>
      </div>

      {/* Existing Links */}
      <div className="space-y-3">
        <h4 className="font-medium">Link mời hiện có ({activeLinks.length})</h4>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : inviteLinks && inviteLinks.length > 0 ? (
          <ScrollArea className="h-[240px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Đã dùng</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inviteLinks.map((link) => {
                  const status = getExpiryStatus(link.expires_at, link.is_revoked);
                  return (
                    <TableRow key={link.id}>
                      <TableCell className="font-mono text-sm">
                        {link.code}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {link.use_count}{link.max_uses ? `/${link.max_uses}` : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyLink(link.code, link.id)}
                            disabled={link.is_revoked}
                          >
                            {copiedId === link.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          {!link.is_revoked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedLinkId(link.id);
                                setRevokeDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có link mời nào. Hãy tạo link mời đầu tiên!
          </div>
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thu hồi link mời?</AlertDialogTitle>
            <AlertDialogDescription>
              Link mời này sẽ không còn hoạt động và mọi người sử dụng link này sẽ không thể tham gia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeLink}>
              Thu hồi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
