import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  created_at: string;
}

export function useLessonProgress(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['lesson-progress', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching lesson progress:', error);
        return null;
      }
      
      return data as LessonProgress | null;
    },
    enabled: !!lessonId && !!user?.id,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId || !user?.id) {
        throw new Error('Missing lessonId or user');
      }

      const { data, error } = await supabase
        .rpc('award_lesson_completion_points', {
          p_lesson_id: lessonId,
          p_points: 5
        });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      const result = data as { success?: boolean; points_awarded?: number } | null;
      const pointsAwarded = result?.points_awarded || 0;
      if (pointsAwarded > 0) {
        toast.success(`🎉 +${pointsAwarded} XP! Bạn đã hoàn thành bài học`);
      } else {
        toast.success('✓ Đã đánh dấu hoàn thành bài học');
      }
      
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress'] });
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
    },
    onError: (error: any) => {
      if (error.message?.includes('Already completed')) {
        toast.info('Bạn đã hoàn thành bài học này rồi');
      } else {
        console.error('Error marking lesson complete:', error);
        toast.error('Không thể đánh dấu hoàn thành. Vui lòng thử lại.');
      }
    }
  });

  return {
    isCompleted: !!progress,
    completedAt: progress?.completed_at,
    markComplete: markCompleteMutation.mutate,
    isLoading: markCompleteMutation.isPending,
    isLoadingProgress,
  };
}

export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-progress', courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user?.id) return { completed: 0, total: 0 };

      // Get all lessons in this course
      const { data: sections } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);

      if (!sections?.length) return { completed: 0, total: 0 };

      const sectionIds = sections.map(s => s.id);

      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id')
        .in('section_id', sectionIds);

      if (!lessons?.length) return { completed: 0, total: 0 };

      const lessonIds = lessons.map(l => l.id);

      // Get completed lessons
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      return {
        completed: progress?.length || 0,
        total: lessons.length,
        percentage: lessons.length > 0 
          ? Math.round((progress?.length || 0) / lessons.length * 100) 
          : 0
      };
    },
    enabled: !!courseId && !!user?.id,
  });
}
