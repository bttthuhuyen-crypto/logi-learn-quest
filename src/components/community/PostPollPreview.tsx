import React, { useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Poll } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PostPollPreviewProps {
  poll: Poll;
  postId: string;
}

export const PostPollPreview: React.FC<PostPollPreviewProps> = ({ poll, postId }) => {
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);

  // Check if user has voted
  const { data: userVotes = [] } = useQuery({
    queryKey: ['poll-votes', poll.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(v => v.option_id);
    },
  });

  const hasVoted = userVotes.length > 0;
  const isPollEnded = poll.ends_at && new Date(poll.ends_at) < new Date();

  const handleVote = async (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVoted || isPollEnded || isVoting) return;

    setIsVoting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('poll_votes')
        .insert({
          poll_id: poll.id,
          option_id: optionId,
          user_id: user.id,
        });

      queryClient.invalidateQueries({ queryKey: ['poll-votes', poll.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <p className="font-medium">{poll.question}</p>
      
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = poll.total_votes > 0 
            ? Math.round((option.vote_count / poll.total_votes) * 100) 
            : 0;
          const isSelected = userVotes.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={(e) => handleVote(option.id, e)}
              disabled={hasVoted || isPollEnded || isVoting}
              className={cn(
                'relative w-full text-left rounded-lg border transition-colors overflow-hidden',
                hasVoted || isPollEnded
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-foreground/30',
                isSelected
                  ? 'border-foreground/50'
                  : 'border-border'
              )}
            >
              {/* Progress bar background */}
              {(hasVoted || isPollEnded) && (
                <div
                  className="absolute inset-y-0 left-0 bg-muted transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <Check className="h-4 w-4 text-foreground" />
                  )}
                  <span className="text-sm">{option.option_text}</span>
                </div>
                {(hasVoted || isPollEnded) && (
                  <span className="text-sm font-medium">{percentage}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{poll.total_votes} phiếu bầu</span>
        {poll.ends_at && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isPollEnded ? (
                <span>Đã kết thúc</span>
              ) : (
                <span>
                  Kết thúc {formatDistanceToNow(new Date(poll.ends_at), { addSuffix: true, locale: vi })}
                </span>
              )}
            </div>
          </>
        )}
        {poll.is_multiple_choice && (
          <>
            <span>•</span>
            <span>Chọn nhiều</span>
          </>
        )}
      </div>
    </div>
  );
};
