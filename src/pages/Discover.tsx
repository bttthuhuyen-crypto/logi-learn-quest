import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DiscoverSearchBar } from '@/components/discover/DiscoverSearchBar';
import { DiscoverCategoryChips } from '@/components/discover/DiscoverCategoryChips';
import { CommunityCard } from '@/components/discover/CommunityCard';
import { useDiscoverCommunities } from '@/hooks/useDiscoverCommunities';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';

export default function Discover() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: communities, isLoading } = useDiscoverCommunities({
    category: selectedCategory,
    search: debouncedSearch,
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Khám phá cộng đồng</h1>
          <p className="text-muted-foreground">
            hoặc{' '}
            <Link 
              to="/community/create" 
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              tạo cộng đồng của bạn
            </Link>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <DiscoverSearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
        </div>

        {/* Category Chips */}
        <div className="mb-8">
          <DiscoverCategoryChips
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Community Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/9] w-full rounded-lg" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community, index) => (
              <CommunityCard 
                key={community.id} 
                community={community} 
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Không tìm thấy cộng đồng nào
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
