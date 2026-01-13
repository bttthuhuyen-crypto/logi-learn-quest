import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useCategories, Category } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortOption } from '@/hooks/usePosts';

interface CategoryChipsProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null, defaultSort?: SortOption) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { data: categories, isLoading } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkOverflow = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    const scrollEl = scrollRef.current;
    
    scrollEl?.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      scrollEl?.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow, categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectAll = () => {
    onSelectCategory(null);
  };

  const handleSelectCategory = (category: Category) => {
    onSelectCategory(category.id, category.default_sort as SortOption);
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left scroll button - Desktop only, show when overflow left */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/95 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Gradient fade - Left */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none hidden md:block" />
      )}

      {/* Chips container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1 scroll-smooth touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* "Tất cả" chip */}
        <button
          onClick={handleSelectAll}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
            selectedCategoryId === null
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Tất cả
        </button>

        {/* Category chips */}
        {categories?.map((category: Category) => (
          <button
            key={category.id}
            onClick={() => handleSelectCategory(category)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
              selectedCategoryId === category.id
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {category.emoji && <span className="text-base">{category.emoji}</span>}
            <span>{category.name}</span>
            {category.post_count > 0 && (
              <span className={cn(
                "text-xs",
                selectedCategoryId === category.id
                  ? "opacity-70"
                  : "opacity-50"
              )}>
                ({category.post_count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Gradient fade - Right */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none hidden md:block" />
      )}

      {/* Right scroll button - Desktop only, show when overflow right */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/95 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
