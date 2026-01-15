import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useSearchPosts } from '@/hooks/useSearchPosts';

export interface MentionSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionSuggestionProps {
  query: string;
  command: (item: { id: string; label: string }) => void;
}

export const MentionSuggestion = forwardRef<MentionSuggestionRef, MentionSuggestionProps>(
  ({ query, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { data: posts, isLoading } = useSearchPosts(query);

    const items = posts?.slice(0, 5) || [];

    useEffect(() => {
      setSelectedIndex(0);
    }, [items.length]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          if (items[selectedIndex]) {
            command({ id: items[selectedIndex].id, label: items[selectedIndex].title });
          }
          return true;
        }
        return false;
      },
    }));

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-1 max-h-60 overflow-auto min-w-[250px] z-50">
        {isLoading ? (
          <div className="p-2 text-sm text-muted-foreground">Đang tìm...</div>
        ) : items.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">Không tìm thấy bài viết</div>
        ) : (
          items.map((post, index) => (
            <button
              key={post.id}
              onClick={() => command({ id: post.id, label: post.title })}
              className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
              }`}
            >
              <span className="line-clamp-1">{post.title}</span>
            </button>
          ))
        )}
      </div>
    );
  }
);

MentionSuggestion.displayName = 'MentionSuggestion';
