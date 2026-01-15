import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Image as ImageIcon,
  X,
  Upload,
  Link as LinkIcon,
  Presentation,
  RefreshCw,
  Bell
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Event, EventLocationType, EventFormData as HookEventFormData, useCreateEvent, useUpdateEvent } from '@/hooks/useEvents';

interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editEvent?: Event | null;
}

const eventSchema = z.object({
  title: z.string()
    .min(1, 'Tiêu đề không được để trống')
    .max(200, 'Tiêu đề tối đa 200 ký tự'),
  start_date: z.date({
    required_error: 'Vui lòng chọn ngày',
  }),
  start_time: z.string().min(1, 'Vui lòng chọn giờ'),
  duration: z.number().min(1),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrence_day_of_week: z.number().min(0).max(6).optional(),
  recurrence_end_type: z.enum(['never', 'on_date', 'after_occurrences']).optional(),
  recurrence_end_date: z.date().optional(),
  recurrence_occurrences: z.number().min(1).max(100).optional(),
  location_type: z.enum(['skool_call', 'skool_webinar', 'zoom', 'google_meet', 'in_person', 'other']),
  location_url: z.string().optional(),
  location_address: z.string().optional(),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  send_notification: z.boolean().default(false),
});

type EventFormData = z.infer<typeof eventSchema>;

const durationOptions = [
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '1 giờ' },
  { value: 90, label: '1 giờ 30 phút' },
  { value: 120, label: '2 giờ' },
  { value: 180, label: '3 giờ' },
  { value: 240, label: '4 giờ' },
  { value: 1440, label: 'Cả ngày' },
];

const timezoneOptions = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Giờ Việt Nam (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
];

const locationTypeOptions = [
  { value: 'skool_call', label: 'Skool Call', icon: Video, description: 'Tự động tạo link' },
  { value: 'skool_webinar', label: 'Webinar', icon: Presentation, description: 'Webinar trong app' },
  { value: 'zoom', label: 'Zoom', icon: Video, description: 'Nhập link Zoom' },
  { value: 'google_meet', label: 'Google Meet', icon: Video, description: 'Nhập link Meet' },
  { value: 'in_person', label: 'Trực tiếp', icon: MapPin, description: 'Nhập địa chỉ' },
  { value: 'other', label: 'Khác', icon: LinkIcon, description: 'Nhập URL khác' },
];

const recurrencePatternOptions = [
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
  { value: 'monthly', label: 'Hàng tháng' },
  { value: 'yearly', label: 'Hàng năm' },
];

const dayOfWeekOptions = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ hai' },
  { value: 2, label: 'Thứ ba' },
  { value: 3, label: 'Thứ tư' },
  { value: 4, label: 'Thứ năm' },
  { value: 5, label: 'Thứ sáu' },
  { value: 6, label: 'Thứ bảy' },
];

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  isOpen,
  onClose,
  editEvent,
}) => {
  const { user } = useAuth();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const [isUploading, setIsUploading] = useState(false);

  const isEditMode = !!editEvent;

  // Generate time options (15min intervals)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        options.push({ value: `${hour}:${minute}`, label: `${hour}:${minute}` });
      }
    }
    return options;
  }, []);

  const defaultValues: EventFormData = {
    title: '',
    start_date: new Date(),
    start_time: '19:00',
    duration: 60,
    timezone: 'Asia/Ho_Chi_Minh',
    is_recurring: false,
    recurrence_pattern: undefined,
    recurrence_day_of_week: undefined,
    recurrence_end_type: undefined,
    recurrence_end_date: undefined,
    recurrence_occurrences: undefined,
    location_type: 'zoom',
    location_url: '',
    location_address: '',
    description: '',
    cover_image_url: '',
    send_notification: false,
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  // Reset/prefill form when editEvent changes
  useEffect(() => {
    if (editEvent) {
      form.reset({
        title: editEvent.title,
        start_date: new Date(editEvent.start_date),
        start_time: editEvent.start_time.slice(0, 5),
        duration: editEvent.duration_minutes,
        timezone: editEvent.timezone || 'Asia/Ho_Chi_Minh',
        is_recurring: editEvent.is_recurring,
        recurrence_pattern: editEvent.recurrence_pattern || undefined,
        recurrence_day_of_week: editEvent.recurrence_day_of_week ?? undefined,
        recurrence_end_type: undefined,
        recurrence_end_date: undefined,
        recurrence_occurrences: undefined,
        location_type: (editEvent.location_type as EventLocationType) || 'zoom',
        location_url: editEvent.location_url || '',
        location_address: editEvent.location_address || '',
        description: editEvent.description || '',
        cover_image_url: editEvent.cover_image_url || '',
        send_notification: false,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editEvent, form]);

  const watchLocationType = form.watch('location_type');
  const watchIsRecurring = form.watch('is_recurring');
  const watchRecurrencePattern = form.watch('recurrence_pattern');
  const watchRecurrenceEndType = form.watch('recurrence_end_type');
  const watchCoverImage = form.watch('cover_image_url');

  const isOnlineEvent = ['zoom', 'google_meet', 'skool_call', 'skool_webinar', 'other'].includes(watchLocationType);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Vui lòng chọn file ảnh', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Ảnh không được vượt quá 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('event-covers')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-covers')
        .getPublicUrl(fileName);

      form.setValue('cover_image_url', publicUrl);
      toast({ title: 'Đã tải ảnh lên' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Không thể tải ảnh lên', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeCoverImage = () => {
    form.setValue('cover_image_url', '');
  };

  const onSubmit = async (data: EventFormData) => {
    const formData: HookEventFormData = {
      title: data.title,
      start_date: data.start_date,
      start_time: data.start_time,
      duration: data.duration,
      timezone: data.timezone || 'Asia/Ho_Chi_Minh',
      is_recurring: data.is_recurring || false,
      recurrence_pattern: data.recurrence_pattern,
      recurrence_day_of_week: data.recurrence_day_of_week,
      recurrence_end_type: data.recurrence_end_type,
      recurrence_end_date: data.recurrence_end_date,
      recurrence_occurrences: data.recurrence_occurrences,
      location_type: data.location_type,
      location_url: data.location_url,
      location_address: data.location_address,
      description: data.description,
      cover_image_url: data.cover_image_url,
      send_notification: data.send_notification,
    };

    if (isEditMode && editEvent) {
      await updateEvent.mutateAsync({ eventId: editEvent.id, eventData: formData });
    } else {
      await createEvent.mutateAsync(formData);
    }
    onClose();
  };

  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Ảnh bìa</Label>
              {watchCoverImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={watchCoverImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeCoverImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="text-center text-muted-foreground">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm">Đang tải...</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Click hoặc kéo thả để upload ảnh bìa</p>
                      <p className="text-xs mt-1">Tỷ lệ 16:9, tối đa 5MB</p>
                    </div>
                  )}
                </label>
              )}
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề sự kiện *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="VD: Webinar: Logistics Trends 2026"
                        maxLength={200}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {field.value?.length || 0}/200
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy") : "Chọn ngày"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ bắt đầu *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Chọn giờ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {timeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration & Timezone */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng *</FormLabel>
                    <Select 
                      value={String(field.value)} 
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Múi giờ</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezoneOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recurring Options */}
            <div className="space-y-4 rounded-lg border p-4">
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="flex items-center gap-2 cursor-pointer">
                      <RefreshCw className="h-4 w-4" />
                      Lặp lại sự kiện
                    </FormLabel>
                  </FormItem>
                )}
              />

              {watchIsRecurring && (
                <div className="pl-6 space-y-4 border-l-2 ml-2">
                  {/* Recurrence Pattern */}
                  <FormField
                    control={form.control}
                    name="recurrence_pattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tần suất</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tần suất" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {recurrencePatternOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Day of Week - only for weekly */}
                  {watchRecurrencePattern === 'weekly' && (
                    <FormField
                      control={form.control}
                      name="recurrence_day_of_week"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày trong tuần</FormLabel>
                          <Select 
                            value={field.value?.toString()} 
                            onValueChange={(v) => field.onChange(Number(v))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn ngày" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dayOfWeekOptions.map((opt) => (
                                <SelectItem key={opt.value} value={String(opt.value)}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Recurrence End Type */}
                  <FormField
                    control={form.control}
                    name="recurrence_end_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Kết thúc</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="never" id="never" />
                              <Label htmlFor="never">Không bao giờ</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="on_date" id="on_date" />
                              <Label htmlFor="on_date">Vào ngày</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="after_occurrences" id="after_occurrences" />
                              <Label htmlFor="after_occurrences">Sau số lần</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Date - only if end_type = on_date */}
                  {watchRecurrenceEndType === 'on_date' && (
                    <FormField
                      control={form.control}
                      name="recurrence_end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày kết thúc</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "dd/MM/yyyy") : "Chọn ngày"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                locale={vi}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Occurrences - only if end_type = after_occurrences */}
                  {watchRecurrenceEndType === 'after_occurrences' && (
                    <FormField
                      control={form.control}
                      name="recurrence_occurrences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số lần lặp lại</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Location Type */}
            <FormField
              control={form.control}
              name="location_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Hình thức *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                      {locationTypeOptions.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <div key={opt.value}>
                            <RadioGroupItem
                              value={opt.value}
                              id={opt.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={opt.value}
                              className={cn(
                                "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                              )}
                            >
                              <Icon className="h-5 w-5 mb-2" />
                              <span className="text-sm font-medium">{opt.label}</span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location URL (for online events) */}
            {isOnlineEvent && !['skool_call', 'skool_webinar'].includes(watchLocationType) && (
              <FormField
                control={form.control}
                name="location_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link tham gia</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="https://zoom.us/j/..."
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Location Address (for in-person events) */}
            {!isOnlineEvent && (
              <FormField
                control={form.control}
                name="location_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Mô tả chi tiết về sự kiện... (Hỗ trợ Markdown)"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Send Notification */}
            <FormField
              control={form.control}
              name="send_notification"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="flex items-center gap-2 cursor-pointer">
                      <Bell className="h-4 w-4" />
                      Gửi email thông báo cho thành viên
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Tất cả thành viên sẽ nhận được email về sự kiện này
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang xử lý...' : isEditMode ? 'Lưu thay đổi' : 'Tạo sự kiện'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
