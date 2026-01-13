import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'bank_account';
  bank_name: string;
  card_last_four: string | null;
  card_holder_name: string | null;
  card_expiry: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  branch: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddCardPayload {
  bank_name: string;
  card_last_four: string;
  card_holder_name: string;
  card_expiry: string;
}

export interface AddBankAccountPayload {
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  branch?: string;
}

export function usePaymentMethods() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentMethod[];
    },
    enabled: !!user?.id,
  });

  const cards = paymentMethods?.filter(m => m.type === 'card') || [];
  const bankAccounts = paymentMethods?.filter(m => m.type === 'bank_account') || [];

  const addCardMutation = useMutation({
    mutationFn: async (payload: AddCardPayload) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user.id,
          type: 'card',
          bank_name: payload.bank_name,
          card_last_four: payload.card_last_four,
          card_holder_name: payload.card_holder_name,
          card_expiry: payload.card_expiry,
          is_default: cards.length === 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods', user?.id] });
      toast.success(t.paymentMethods.cardAdded);
    },
    onError: (error) => {
      console.error('Failed to add card:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  const addBankAccountMutation = useMutation({
    mutationFn: async (payload: AddBankAccountPayload) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user.id,
          type: 'bank_account',
          bank_name: payload.bank_name,
          account_number: payload.account_number,
          account_holder_name: payload.account_holder_name,
          branch: payload.branch || null,
          is_default: bankAccounts.length === 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods', user?.id] });
      toast.success(t.paymentMethods.accountAdded);
    },
    onError: (error) => {
      console.error('Failed to add bank account:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'card' | 'bank_account' }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // First, unset all defaults of this type
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', type);

      // Then set the new default
      const { error } = await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods', user?.id] });
      toast.success(t.paymentMethods.defaultSet);
    },
    onError: (error) => {
      console.error('Failed to set default:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods', user?.id] });
      toast.success(t.paymentMethods.deleted);
    },
    onError: (error) => {
      console.error('Failed to delete:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  const updateBankAccountMutation = useMutation({
    mutationFn: async ({ id, ...payload }: AddBankAccountPayload & { id: string }) => {
      const { error } = await supabase
        .from('user_payment_methods')
        .update({
          bank_name: payload.bank_name,
          account_number: payload.account_number,
          account_holder_name: payload.account_holder_name,
          branch: payload.branch || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods', user?.id] });
      toast.success(t.paymentMethods.accountUpdated);
    },
    onError: (error) => {
      console.error('Failed to update bank account:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  return {
    cards,
    bankAccounts,
    isLoading,
    addCard: addCardMutation.mutate,
    addBankAccount: addBankAccountMutation.mutate,
    updateBankAccount: updateBankAccountMutation.mutate,
    setDefault: setDefaultMutation.mutate,
    deleteMethod: deleteMutation.mutate,
    isAdding: addCardMutation.isPending || addBankAccountMutation.isPending,
    isUpdating: updateBankAccountMutation.isPending || setDefaultMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
