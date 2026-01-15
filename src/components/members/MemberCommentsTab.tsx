import { useState } from "react";
import { useMemberComments } from "@/hooks/useMemberComments";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

interface MemberCommentsTabProps {
  userId: string;
}

export function MemberCommentsTab({ userId }: MemberCommentsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMemberComments(userId, page);
  const navigate = useNavigate();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.comments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
        <p>{language === "vi" ? "Chưa có bình luận nào" : "No comments yet"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {data.comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/community/${comment.post_id}`)}
        >
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {language === "vi" ? "Trên bài viết:" : "On post:"}{" "}
            <span className="font-medium text-foreground">{comment.post_title}</span>
          </p>
          <p className="text-sm line-clamp-2">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: language === "vi" ? vi : undefined,
              })}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {comment.like_count}
            </span>
          </div>
        </div>
      ))}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
