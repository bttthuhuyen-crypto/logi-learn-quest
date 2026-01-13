import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  className?: string;
}

const languages: { value: Language; label: string; flag: string }[] = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
];

export function LanguageSwitcher({ 
  variant = 'ghost', 
  showLabel = true,
  className 
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const currentLang = languages.find(l => l.value === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <span className="text-base mr-1">{currentLang.flag}</span>
          {showLabel && <span className="hidden sm:inline">{currentLang.label}</span>}
          <Globe className="h-4 w-4 sm:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuRadioGroup 
          value={language} 
          onValueChange={(value) => setLanguage(value as Language)}
        >
          {languages.map((lang) => (
            <DropdownMenuRadioItem 
              key={lang.value} 
              value={lang.value}
              className="cursor-pointer"
            >
              <span className="text-base mr-2">{lang.flag}</span>
              {lang.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
