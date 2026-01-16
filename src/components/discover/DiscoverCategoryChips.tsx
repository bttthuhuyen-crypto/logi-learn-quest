import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityCategories } from '@/hooks/useCommunityCategories';

interface DiscoverCategoryChipsProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function DiscoverCategoryChips({ selectedCategory, onSelectCategory }: DiscoverCategoryChipsProps) {
  const { data: categories, isLoading } = useCommunityCategories();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => onSelectCategory(null)}
        className="rounded-full px-4"
        size="sm"
      >
        Tất cả
      </Button>
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? 'default' : 'outline'}
          onClick={() => onSelectCategory(category.slug)}
          className="rounded-full px-4"
          size="sm"
        >
          {category.emoji} {category.name}
        </Button>
      ))}
    </div>
  );
}
