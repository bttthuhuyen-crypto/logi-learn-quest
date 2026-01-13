import React, { useState } from 'react';
import { Check, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Poll } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, differenceInHours, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PostPollPreviewProps {
  poll: Poll;
  postId: string;
}

const formatTimeRemaining = (endDate: Date): string => {
  const now = new Date();
  const hoursLeft = differenceInHours(endDate, now);
  const daysLeft = differenceInDays(endDate, now);

  if (hoursLeft < 1) {
    return 'Sắp kết thúc';
  } else if (hoursLeft < 24) {
    return `Còn ${hoursLeft} giờ`;
  } else if (daysLeft === 1) {
    return 'Còn 1 ngày';
  } else {
    return `Còn ${daysLeft} ngày`;
  }
};

export const PostPollPreview: React.FC<PostPollPreviewProps> = ({ poll, postId }) => {
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);
  const [votingOptionId, setVotingOptionId] = useState<string | null>(null);

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
  const showResults = hasVoted || isPollEnded;

  const handleVote = async (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVoted || isPollEnded || isVoting) return;

    setIsVoting(true);
    setVotingOptionId(optionId);
    
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
      setVotingOptionId(null);
    }
  };

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <p className="font-medium text-foreground">{poll.question}</p>
      
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = poll.total_votes > 0 
            ? Math.round((option.vote_count / poll.total_votes) * 100) 
            : 0;
          const isSelected = userVotes.includes(option.id);
          const isLoadingThis = votingOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={(e) => handleVote(option.id, e)}
              disabled={hasVoted || isPollEnded || isVoting}
              className={cn(
                'relative w-full text-left rounded-lg border transition-all duration-200 overflow-hidden group',
                showResults
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-foreground/40 hover:bg-muted/50',
                isSelected
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border'
              )}
            >
              {/* Progress bar background */}
              {showResults && (
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 transition-all duration-500 ease-out',
                    isSelected ? 'bg-primary/20' : 'bg-muted'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isLoadingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  ) : isSelected ? (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  ) : !showResults ? (
                    <div className={cn(
                      'h-4 w-4 rounded-full border-2 shrink-0 transition-colors',
                      poll.is_multiple_choice ? 'rounded-sm' : 'rounded-full',
                      'border-muted-foreground/40 group-hover:border-foreground/60'
                    )} />
                  ) : null}
                  <span className={cn(
                    'text-sm truncate',
                    isSelected && 'font-medium text-foreground'
                  )}>
                    {option.option_text}
                  </span>
                </div>
                {showResults && (
                  <span className={cn(
                    'text-sm font-medium ml-2 shrink-0',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {hasVoted && (
          <div className="flex items-center gap-1 text-primary">
            <CheckCircle2 className="h-3 w-3" />
            <span>Bạn đã vote</span>
          </div>
        )}
        {hasVoted && <span>•</span>}
        <span>{poll.total_votes} phiếu bầu</span>
        {poll.ends_at && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isPollEnded ? (
                <span className="text-destructive">Đã kết thúc</span>
              ) : (
                <span>{formatTimeRemaining(new Date(poll.ends_at))}</span>
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
