import { cn } from "@/lib/utils";

interface StatusDotProps {
  isOnline: boolean;
  size?: 'sm' | 'md';
}

export const StatusDot = ({ isOnline, size = 'sm' }: StatusDotProps) => (
  <span 
    className={cn(
      "inline-block rounded-full",
      isOnline ? "bg-green-500" : "bg-gray-400",
      size === 'sm' ? "w-2 h-2" : "w-3 h-3"
    )} 
    title={isOnline ? "Online" : "Offline"}
  />
);
