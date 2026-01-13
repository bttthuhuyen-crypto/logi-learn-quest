import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SendEmailInvitesOptions {
  emails: string[];
  role: string;
  customMessage?: string;
}

interface ParsedEmail {
  email: string;
  isValid: boolean;
  error?: string;
}

export const useEmailInvites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const parseEmails = (input: string): ParsedEmail[] => {
    const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
    const seen = new Set<string>();
    
    return lines.map(email => {
      const normalizedEmail = email.toLowerCase();
      
      if (!validateEmail(normalizedEmail)) {
        return { email, isValid: false, error: 'Email không hợp lệ' };
      }
      
      if (seen.has(normalizedEmail)) {
        return { email, isValid: false, error: 'Email trùng lặp' };
      }
      
      seen.add(normalizedEmail);
      return { email: normalizedEmail, isValid: true };
    });
  };

  const sendEmailInvites = useMutation({
    mutationFn: async (options: SendEmailInvitesOptions) => {
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          emails: options.emails,
          role: options.role,
          customMessage: options.customMessage,
          invitedBy: user?.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invite-logs'] });
      toast({
        title: 'Lời mời đã được gửi',
        description: `Đã gửi ${data?.sent || 0} lời mời thành công.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi lời mời: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const importFromCSV = useMutation({
    mutationFn: async (options: SendEmailInvitesOptions) => {
      // Log imports to database
      const inviteLogs = options.emails.map(email => ({
        email,
        invite_type: 'csv',
        status: 'sent',
        invited_by: user?.id,
      }));

      const { error: logError } = await supabase
        .from('invite_logs')
        .insert(inviteLogs);

      if (logError) throw logError;

      // Send emails
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          emails: options.emails,
          role: options.role,
          customMessage: options.customMessage,
          invitedBy: user?.id,
          inviteType: 'csv',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invite-logs'] });
      toast({
        title: 'Import thành công',
        description: `Đã import và gửi lời mời đến ${data?.sent || 0} email.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể import: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    parseEmails,
    validateEmail,
    sendEmailInvites,
    importFromCSV,
  };
};
