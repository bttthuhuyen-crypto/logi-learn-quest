import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useEmailInvites } from '@/hooks/useEmailInvites';
import { ScrollArea } from '@/components/ui/scroll-area';

export const EmailInviteTab = () => {
  const { t } = useLanguage();
  const { parseEmails, sendEmailInvites } = useEmailInvites();
  
  const [emailInput, setEmailInput] = useState('');
  const [role, setRole] = useState('member');
  const [customMessage, setCustomMessage] = useState('');

  const parsedEmails = useMemo(() => {
    if (!emailInput.trim()) return [];
    return parseEmails(emailInput);
  }, [emailInput, parseEmails]);

  const validEmails = parsedEmails.filter(e => e.isValid);
  const invalidEmails = parsedEmails.filter(e => !e.isValid);

  const handleSendInvites = async () => {
    if (validEmails.length === 0) return;
    
    await sendEmailInvites.mutateAsync({
      emails: validEmails.map(e => e.email),
      role,
      customMessage: customMessage || undefined,
    });

    setEmailInput('');
    setCustomMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="emails">Email (mỗi dòng một email)</Label>
        <Textarea
          id="emails"
          placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
        />
      </div>

      {/* Email Preview */}
      {parsedEmails.length > 0 && (
        <div className="space-y-2">
          <Label>Xem trước ({validEmails.length} hợp lệ, {invalidEmails.length} không hợp lệ)</Label>
          <ScrollArea className="h-[120px] border rounded-md p-3">
            <div className="space-y-1.5">
              {parsedEmails.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  {item.isValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <span className={item.isValid ? '' : 'text-muted-foreground line-through'}>
                    {item.email}
                  </span>
                  {item.error && (
                    <Badge variant="destructive" className="text-xs">
                      {item.error}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Role Selection */}
      <div className="space-y-2">
        <Label>Vai trò</Label>
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

      {/* Custom Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Tin nhắn tùy chỉnh (tùy chọn)</Label>
        <Textarea
          id="message"
          placeholder="Nhập tin nhắn cá nhân để gửi kèm lời mời..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {/* Send Button */}
      <Button
        className="w-full"
        onClick={handleSendInvites}
        disabled={validEmails.length === 0 || sendEmailInvites.isPending}
      >
        {sendEmailInvites.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Gửi lời mời ({validEmails.length})
      </Button>
    </div>
  );
};
