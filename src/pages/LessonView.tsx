import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Play, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LessonSidebar } from '@/components/classroom/LessonSidebar';
import { LessonDiscussion } from '@/components/classroom/LessonDiscussion';
import { useCourseDetail, CourseLesson } from '@/hooks/useCourses';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

const LessonView: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { course, sections, loading } = useCourseDetail(courseId);
  const { isCompleted, markComplete, isLoading: isMarkingComplete } = useLessonProgress(lessonId);

  // Find current lesson
  const allLessons: CourseLesson[] = sections.flatMap(s => s.lessons || []);
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const lesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-64px)]">
          <div className="w-80 border-r p-4 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-8 space-y-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!lesson) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              {language === 'vi' ? 'Không tìm thấy bài học' : 'Lesson not found'}
            </p>
            <Button asChild>
              <Link to={`/classroom/${courseId}`}>
                {language === 'vi' ? 'Quay lại khóa học' : 'Back to course'}
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const sanitizedContent = lesson.content 
    ? DOMPurify.sanitize(lesson.content)
    : '';

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <LessonSidebar 
          sections={sections} 
          courseId={courseId!}
          currentLessonId={lessonId}
        />

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
            {/* Back to course */}
            <Link 
              to={`/classroom/${courseId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {course?.title}
            </Link>

            {/* Video Player */}
            {lesson.video_url && (
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                <video 
                  src={lesson.video_url} 
                  controls 
                  className="w-full h-full"
                  poster={lesson.thumbnail_url || undefined}
                />
              </div>
            )}

            {/* Lesson Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-muted-foreground mt-2">{lesson.description}</p>
              )}
            </div>

            {/* Lesson Content */}
            {sanitizedContent && (
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            )}

            {/* Complete Button */}
            <div className="flex items-center gap-4 py-6 border-t border-b">
              <Button
                size="lg"
                onClick={() => markComplete()}
                disabled={isCompleted || isMarkingComplete}
                className={cn(
                  "gap-2",
                  isCompleted 
                    ? "bg-green-600 hover:bg-green-600" 
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {isMarkingComplete ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                  </>
                ) : isCompleted ? (
                  <>
                    <Check className="h-4 w-4" />
                    {language === 'vi' ? 'Đã hoàn thành' : 'Completed'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {language === 'vi' ? 'ĐÁNH DẤU ĐÃ HOÀN THÀNH (+5 XP)' : 'MARK AS COMPLETE (+5 XP)'}
                  </>
                )}
              </Button>

              {isCompleted && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ {language === 'vi' ? 'Bạn đã nhận 5 XP cho bài học này' : 'You earned 5 XP for this lesson'}
                </span>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {prevLesson ? (
                <Button variant="outline" asChild>
                  <Link to={`/classroom/${courseId}/lesson/${prevLesson.id}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'vi' ? 'Bài trước' : 'Previous'}
                  </Link>
                </Button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Button asChild>
                  <Link to={`/classroom/${courseId}/lesson/${nextLesson.id}`}>
                    {language === 'vi' ? 'Bài tiếp theo' : 'Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="default">
                  <Link to={`/classroom/${courseId}`}>
                    {language === 'vi' ? 'Hoàn thành khóa học' : 'Complete Course'}
                  </Link>
                </Button>
              )}
            </div>

            {/* Discussion Widget */}
            {lesson.discussion_post_id && (
              <div className="pt-8 border-t">
                <LessonDiscussion 
                  postId={lesson.discussion_post_id} 
                  lessonTitle={lesson.title}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
};

export default LessonView;
