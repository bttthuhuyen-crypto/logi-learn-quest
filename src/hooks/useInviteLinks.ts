import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InviteLink {
  id: string;
  created_by: string;
  code: string;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  role: string;
  custom_message: string | null;
  is_revoked: boolean;
  created_at: string;
}

interface CreateInviteLinkOptions {
  expiresIn: '24h' | '7d' | '30d' | 'never';
  maxUses: number | null;
  role: string;
  customMessage?: string;
}

export const useInviteLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inviteLinks, isLoading } = useQuery({
    queryKey: ['invite-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invite_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InviteLink[];
    },
    enabled: !!user,
  });

  const createInviteLink = useMutation({
    mutationFn: async (options: CreateInviteLinkOptions) => {
      // Calculate expires_at
      let expiresAt: string | null = null;
      const now = new Date();
      
      switch (options.expiresIn) {
        case '24h':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'never':
          expiresAt = null;
          break;
      }

      // Generate code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_invite_code');

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('invite_links')
        .insert([{
          created_by: user?.id as string,
          code: codeData as string,
          expires_at: expiresAt,
          max_uses: options.maxUses,
          role: options.role as 'member' | 'moderator' | 'admin' | 'owner',
          custom_message: options.customMessage || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as InviteLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invite-links'] });
      toast({
        title: 'Link mời đã được tạo',
        description: 'Bạn có thể sao chép và chia sẻ link này.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo link mời: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const revokeInviteLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('invite_links')
        .update({ is_revoked: true })
        .eq('id', linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invite-links'] });
      toast({
        title: 'Link đã được thu hồi',
        description: 'Link mời này không còn hoạt động.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể thu hồi link: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const getInviteLinkUrl = (code: string) => {
    return `${window.location.origin}/join?invite=${code}`;
  };

  return {
    inviteLinks,
    isLoading,
    createInviteLink,
    revokeInviteLink,
    getInviteLinkUrl,
  };
};
