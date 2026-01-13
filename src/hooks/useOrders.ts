import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type OrderStatus = 'pending' | 'success' | 'failed';
export type PaymentMethod = 'vnpay' | 'bank_transfer' | 'momo';
export type TimeRange = 'this_month' | '3_months' | '6_months' | '1_year' | 'all';

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  course_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  transaction_code: string | null;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
  failed_at: string | null;
  invoice_url: string | null;
  course?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    description: string | null;
  } | null;
}

interface UseOrdersOptions {
  status?: OrderStatus | 'all';
  timeRange?: TimeRange;
  search?: string;
  page?: number;
  pageSize?: number;
}

const getTimeRangeDate = (timeRange: TimeRange): Date | null => {
  const now = new Date();
  
  switch (timeRange) {
    case 'this_month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case '3_months':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case '6_months':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case '1_year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case 'all':
    default:
      return null;
  }
};

export const useOrders = (options: UseOrdersOptions = {}) => {
  const { user } = useAuth();
  const {
    status = 'all',
    timeRange = 'all',
    search = '',
    page = 1,
    pageSize = 10,
  } = options;

  return useQuery({
    queryKey: ['orders', user?.id, status, timeRange, search, page, pageSize],
    queryFn: async () => {
      if (!user) return { orders: [], totalCount: 0, totalPages: 0 };

      let query = supabase
        .from('orders')
        .select(`
          *,
          course:courses(id, title, thumbnail_url, description)
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply time range filter
      const startDate = getTimeRangeDate(timeRange);
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply search filter
      if (search.trim()) {
        query = query.or(`order_code.ilike.%${search}%,course.title.ilike.%${search}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        orders: (data || []) as Order[],
        totalCount,
        totalPages,
      };
    },
    enabled: !!user,
  });
};

// Utility functions
export const formatVND = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + 'đ';
};

export const getPaymentMethodLabel = (method: PaymentMethod, language: string): string => {
  const labels: Record<PaymentMethod, { vi: string; en: string }> = {
    vnpay: { vi: 'VNPay', en: 'VNPay' },
    bank_transfer: { vi: 'Chuyển khoản', en: 'Bank Transfer' },
    momo: { vi: 'MoMo', en: 'MoMo' },
  };
  return labels[method]?.[language as 'vi' | 'en'] || method;
};

export const getStatusConfig = (status: OrderStatus, language: string) => {
  const configs: Record<OrderStatus, { label: { vi: string; en: string }; icon: string; className: string }> = {
    success: {
      label: { vi: 'Thành công', en: 'Success' },
      icon: '✅',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    pending: {
      label: { vi: 'Đang xử lý', en: 'Processing' },
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    failed: {
      label: { vi: 'Thất bại', en: 'Failed' },
      icon: '❌',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
  };
  
  const config = configs[status];
  return {
    ...config,
    label: config.label[language as 'vi' | 'en'] || config.label.vi,
  };
};
