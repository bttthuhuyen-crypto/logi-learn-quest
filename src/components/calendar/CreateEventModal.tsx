import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Video, X } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { EventLocationType } from '@/hooks/useEvents';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const locationTypes: { value: EventLocationType; label: string }[] = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'skool_call', label: 'Skool Call' },
  { value: 'skool_webinar', label: 'Webinar' },
  { value: 'in_person', label: 'Trực tiếp (Offline)' },
  { value: 'other', label: 'Khác' },
];

const durationOptions = [
  { value: 30, label: '30 phút' },
  { value: 60, label: '1 giờ' },
  { value: 90, label: '1.5 giờ' },
  { value: 120, label: '2 giờ' },
  { value: 180, label: '3 giờ' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('19:00');
  const [duration, setDuration] = useState(60);
  const [locationType, setLocationType] = useState<EventLocationType>('zoom');
  const [locationUrl, setLocationUrl] = useState('');
  const [locationAddress, setLocationAddress] = useState('');

  const isOnlineEvent = ['zoom', 'google_meet', 'skool_call', 'skool_webinar', 'other'].includes(locationType);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(undefined);
    setTime('19:00');
    setDuration(60);
    setLocationType('zoom');
    setLocationUrl('');
    setLocationAddress('');
  };

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!user || !date) throw new Error('Missing required data');

      // Need to also set start_at for backward compatibility
      const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);

      const { error } = await supabase.from('events').insert({
        title,
        description: description || null,
        start_at: startDateTime.toISOString(),
        start_date: format(date, 'yyyy-MM-dd'),
        start_time: time + ':00',
        duration_minutes: duration,
        location_type: locationType,
        location_url: isOnlineEvent ? locationUrl : null,
        location_address: !isOnlineEvent ? locationAddress : null,
        creator_id: user.id,
        status: 'scheduled',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Thành công',
        description: 'Sự kiện đã được tạo',
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo sự kiện. Vui lòng thử lại.',
        variant: 'destructive',
      });
      console.error('Create event error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền tiêu đề và chọn ngày',
        variant: 'destructive',
      });
      return;
    }
    createEventMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề sự kiện *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Webinar: Logistics Trends 2026"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về sự kiện..."
              rows={3}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Giờ bắt đầu</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Thời lượng</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Type */}
          <div className="space-y-2">
            <Label>Hình thức</Label>
            <Select value={locationType} onValueChange={(v) => setLocationType(v as EventLocationType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location URL (for online events) */}
          {isOnlineEvent && (
            <div className="space-y-2">
              <Label htmlFor="locationUrl">Link tham gia</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="locationUrl"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Location Address (for in-person events) */}
          {!isOnlineEvent && (
            <div className="space-y-2">
              <Label htmlFor="locationAddress">Địa chỉ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="locationAddress"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? 'Đang tạo...' : 'Tạo sự kiện'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
