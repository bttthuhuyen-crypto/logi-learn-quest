import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { VolumeX } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { MuteDuration } from '@/hooks/useMemberManagement';

interface MuteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  onConfirm: (duration: MuteDuration) => void;
  isLoading?: boolean;
}

export function MuteUserModal({
  open,
  onOpenChange,
  memberName,
  onConfirm,
  isLoading = false,
}: MuteUserModalProps) {
  const { t } = useLanguage();
  const [selectedDuration, setSelectedDuration] = useState<MuteDuration>('24h');

  const durations: { value: MuteDuration; label: string }[] = [
    { value: '1h', label: t.memberSettings.mute1Hour },
    { value: '24h', label: t.memberSettings.mute24Hours },
    { value: '7d', label: t.memberSettings.mute7Days },
    { value: '30d', label: t.memberSettings.mute30Days },
    { value: 'forever', label: t.memberSettings.muteForever },
  ];

  const handleConfirm = () => {
    onConfirm(selectedDuration);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5" />
            {t.memberSettings.muteUser}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t.memberSettings.muteDescription.replace('{name}', memberName)}
          </p>

          <RadioGroup
            value={selectedDuration}
            onValueChange={(value) => setSelectedDuration(value as MuteDuration)}
            className="space-y-3"
          >
            {durations.map((duration) => (
              <div key={duration.value} className="flex items-center space-x-3">
                <RadioGroupItem value={duration.value} id={duration.value} />
                <Label htmlFor={duration.value} className="font-normal cursor-pointer">
                  {duration.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t.common.loading : t.memberSettings.muteUser}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
