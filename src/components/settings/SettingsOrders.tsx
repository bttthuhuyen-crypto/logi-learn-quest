import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Package, Search, FileText, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import {
  useOrders,
  Order,
  OrderStatus,
  TimeRange,
  formatVND,
  getPaymentMethodLabel,
  getStatusConfig,
} from '@/hooks/useOrders';
import { Link } from 'react-router-dom';

export const SettingsOrders = () => {
  const { language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useOrders({
    status: statusFilter,
    timeRange,
    search,
    page,
    pageSize,
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 0;
  const totalCount = data?.totalCount || 0;

  const t = {
    title: language === 'vi' ? 'Lịch sử đơn hàng' : 'Order History',
    filterStatus: language === 'vi' ? 'Trạng thái' : 'Status',
    filterTime: language === 'vi' ? 'Thời gian' : 'Time Range',
    statusAll: language === 'vi' ? 'Tất cả' : 'All',
    statusSuccess: language === 'vi' ? 'Thành công' : 'Success',
    statusPending: language === 'vi' ? 'Đang xử lý' : 'Processing',
    statusFailed: language === 'vi' ? 'Thất bại' : 'Failed',
    thisMonth: language === 'vi' ? 'Tháng này' : 'This month',
    months3: language === 'vi' ? '3 tháng' : '3 months',
    months6: language === 'vi' ? '6 tháng' : '6 months',
    year1: language === 'vi' ? '1 năm' : '1 year',
    allTime: language === 'vi' ? 'Tất cả' : 'All time',
    searchPlaceholder: language === 'vi' ? 'Tìm đơn hàng...' : 'Search orders...',
    viewDetail: language === 'vi' ? 'Xem chi tiết' : 'View details',
    invoice: language === 'vi' ? 'Hóa đơn' : 'Invoice',
    downloadInvoice: language === 'vi' ? 'Tải hóa đơn PDF' : 'Download PDF Invoice',
    orderCode: language === 'vi' ? 'Mã đơn hàng' : 'Order Code',
    amount: language === 'vi' ? 'Số tiền' : 'Amount',
    paymentMethod: language === 'vi' ? 'Phương thức thanh toán' : 'Payment Method',
    transactionCode: language === 'vi' ? 'Mã giao dịch' : 'Transaction Code',
    timeline: language === 'vi' ? 'Lịch sử trạng thái' : 'Status Timeline',
    courseInfo: language === 'vi' ? 'Thông tin khóa học' : 'Course Information',
    paymentInfo: language === 'vi' ? 'Thông tin thanh toán' : 'Payment Information',
    empty: language === 'vi' ? 'Chưa có đơn hàng nào' : 'No orders yet',
    emptyDesc: language === 'vi' ? 'Các khóa học bạn mua sẽ xuất hiện tại đây' : 'Your purchased courses will appear here',
    exploreCourses: language === 'vi' ? 'Khám phá khóa học' : 'Explore Courses',
    orderDetail: language === 'vi' ? 'Chi tiết đơn hàng' : 'Order Details',
    orderCreated: language === 'vi' ? 'Đặt hàng thành công' : 'Order created',
    paymentSuccess: language === 'vi' ? 'Thanh toán thành công' : 'Payment successful',
    paymentFailed: language === 'vi' ? 'Thanh toán thất bại' : 'Payment failed',
    courseActivated: language === 'vi' ? 'Kích hoạt khóa học' : 'Course activated',
    total: language === 'vi' ? 'Tổng' : 'Total',
    orders: language === 'vi' ? 'đơn hàng' : 'orders',
    previous: language === 'vi' ? 'Trước' : 'Previous',
    next: language === 'vi' ? 'Tiếp' : 'Next',
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', {
      locale: language === 'vi' ? vi : enUS,
    });
  };

  const renderOrderCard = (order: Order) => {
    const statusConfig = getStatusConfig(order.status, language);
    
    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Course thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {order.course?.thumbnail_url ? (
                <img
                  src={order.course.thumbnail_url}
                  alt={order.course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Order info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">
                    {order.course?.title || order.order_code}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatVND(order.amount)} • {formatDate(order.created_at)} • {getPaymentMethodLabel(order.payment_method, language)}
                  </p>
                </div>
                <Badge className={statusConfig.className}>
                  <span className="mr-1">{statusConfig.icon}</span>
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {t.viewDetail}
                </Button>
                {order.invoice_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(order.invoice_url!, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    {t.invoice}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;

    const statusConfig = getStatusConfig(selectedOrder.status, language);

    const timelineEvents = [
      {
        date: selectedOrder.created_at,
        label: t.orderCreated,
        completed: true,
      },
      ...(selectedOrder.status === 'success' && selectedOrder.paid_at
        ? [
            {
              date: selectedOrder.paid_at,
              label: t.paymentSuccess,
              completed: true,
            },
            {
              date: selectedOrder.paid_at,
              label: t.courseActivated,
              completed: true,
            },
          ]
        : []),
      ...(selectedOrder.status === 'failed' && selectedOrder.failed_at
        ? [
            {
              date: selectedOrder.failed_at,
              label: t.paymentFailed,
              completed: true,
            },
          ]
        : []),
    ];

    return (
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.orderDetail}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order code */}
            <div>
              <p className="text-sm text-muted-foreground">{t.orderCode}</p>
              <p className="font-mono font-medium">#{selectedOrder.order_code}</p>
            </div>

            {/* Course info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-3">{t.courseInfo}</p>
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {selectedOrder.course?.thumbnail_url ? (
                    <img
                      src={selectedOrder.course.thumbnail_url}
                      alt={selectedOrder.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{selectedOrder.course?.title || 'N/A'}</p>
                  {selectedOrder.course?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {selectedOrder.course.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <p className="text-sm font-medium">{t.paymentInfo}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t.amount}</p>
                  <p className="font-medium">{formatVND(selectedOrder.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.paymentMethod}</p>
                  <p className="font-medium">{getPaymentMethodLabel(selectedOrder.payment_method, language)}</p>
                </div>
                {selectedOrder.transaction_code && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">{t.transactionCode}</p>
                    <p className="font-mono">{selectedOrder.transaction_code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-3">{t.timeline}</p>
              <div className="space-y-3">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${event.completed ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      {index < timelineEvents.length - 1 && (
                        <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-medium">{event.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download invoice */}
            {selectedOrder.invoice_url && (
              <Button
                className="w-full"
                onClick={() => window.open(selectedOrder.invoice_url!, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                {t.downloadInvoice}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-lg font-medium mb-2">{t.empty}</h3>
      <p className="text-muted-foreground mb-6">{t.emptyDesc}</p>
      <Button asChild>
        <Link to="/classroom">{t.exploreCourses}</Link>
      </Button>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-32 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-muted-foreground">
          {t.total}: {totalCount} {t.orders}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => setPage(p)}
                  isActive={page === p}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as OrderStatus | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.statusAll}</SelectItem>
            <SelectItem value="success">{t.statusSuccess}</SelectItem>
            <SelectItem value="pending">{t.statusPending}</SelectItem>
            <SelectItem value="failed">{t.statusFailed}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={timeRange}
          onValueChange={(value) => {
            setTimeRange(value as TimeRange);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t.filterTime} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allTime}</SelectItem>
            <SelectItem value="this_month">{t.thisMonth}</SelectItem>
            <SelectItem value="3_months">{t.months3}</SelectItem>
            <SelectItem value="6_months">{t.months6}</SelectItem>
            <SelectItem value="1_year">{t.year1}</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Orders list */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {orders.map(renderOrderCard)}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && orders.length > 0 && renderPagination()}

      {/* Order detail modal */}
      {renderOrderDetailModal()}
    </div>
  );
};
