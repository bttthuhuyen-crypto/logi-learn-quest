import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DiscoverCommunity } from '@/hooks/useDiscoverCommunities';

interface CommunityCardProps {
  community: DiscoverCommunity;
  rank?: number;
}

export function CommunityCard({ community, rank }: CommunityCardProps) {
  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Miễn phí';
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
    const periodLabel = period === 'month' ? '/tháng' : period === 'year' ? '/năm' : '';
    return `${formattedPrice}đ${periodLabel}`;
  };

  return (
    <Link to={`/c/${community.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          {community.cover_image_url ? (
            <img
              src={community.cover_image_url}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          
          {/* Rank Badge */}
          {rank && (
            <Badge 
              className="absolute top-3 left-3 bg-background/90 text-foreground font-bold px-2.5 py-1"
            >
              #{rank}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage src={community.logo_url || undefined} alt={community.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {community.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
            {community.description || 'Chưa có mô tả'}
          </p>

          {/* Footer: Member count + Price */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{community.member_count.toLocaleString('vi-VN')} thành viên</span>
            </div>
            <span className={`font-medium ${community.price === 0 ? 'text-green-600' : 'text-primary'}`}>
              {formatPrice(community.price, community.price_period)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
