import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Clock, Users, BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCourseDetail } from '@/hooks/useCourses';
import { useCourseProgress } from '@/hooks/useLessonProgress';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import DOMPurify from 'dompurify';

const CourseViewer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { course, sections, loading } = useCourseDetail(courseId);
  const { data: progress } = useCourseProgress(courseId);

  // Get first lesson for "Start Learning" button
  const firstLesson = sections[0]?.lessons?.[0];

  // Count total lessons and duration
  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const totalDuration = sections.reduce((acc, s) => {
    return acc + (s.lessons?.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) || 0);
  }, 0);
  const totalMinutes = Math.round(totalDuration / 60);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              {language === 'vi' ? 'Không tìm thấy khóa học' : 'Course not found'}
            </p>
            <Button asChild>
              <Link to="/classroom">
                {language === 'vi' ? 'Quay lại danh sách' : 'Back to courses'}
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const sanitizedIntro = course.introduction_content 
    ? DOMPurify.sanitize(course.introduction_content) 
    : '';

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        {/* Back Button */}
        <Link 
          to="/classroom"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'vi' ? 'Tất cả khóa học' : 'All Courses'}
        </Link>

        {/* Course Header */}
        <div className="relative rounded-2xl overflow-hidden">
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
            {course.description && (
              <p className="text-white/80 max-w-2xl">{course.description}</p>
            )}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{totalLessons} {language === 'vi' ? 'bài học' : 'lessons'}</span>
            </div>
            {totalMinutes > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{totalMinutes} {language === 'vi' ? 'phút' : 'min'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" asChild>
                <Link to={`/classroom/edit/${courseId}`}>
                  {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                </Link>
              </Button>
            )}
            {firstLesson && (
              <Button size="lg" asChild>
                <Link to={`/classroom/${courseId}/lesson/${firstLesson.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  {progress && progress.completed > 0 
                    ? (language === 'vi' ? 'Tiếp tục học' : 'Continue Learning')
                    : (language === 'vi' ? 'Bắt đầu học' : 'Start Learning')
                  }
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Card */}
        {user && progress && progress.total > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">
                  {language === 'vi' ? 'Tiến độ của bạn' : 'Your Progress'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress.completed}/{progress.total} {language === 'vi' ? 'bài học' : 'lessons'}
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {progress.percentage}% {language === 'vi' ? 'hoàn thành' : 'complete'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Introduction */}
        {sanitizedIntro && (
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'vi' ? 'Giới thiệu' : 'Introduction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedIntro }}
              />
            </CardContent>
          </Card>
        )}

        {/* Course Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'vi' ? 'Nội dung khóa học' : 'Course Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
              {sections.map((section, sectionIndex) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge variant="outline" className="font-mono">
                        {sectionIndex + 1}
                      </Badge>
                      <span className="font-medium">{section.title}</span>
                      <span className="text-sm text-muted-foreground">
                        ({section.lessons?.length || 0} {language === 'vi' ? 'bài' : 'lessons'})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-10">
                      {section.lessons?.map((lesson, lessonIndex) => (
                        <Link
                          key={lesson.id}
                          to={`/classroom/${courseId}/lesson/${lesson.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {lessonIndex + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {lesson.title}
                            </p>
                            {lesson.duration_seconds && (
                              <p className="text-xs text-muted-foreground">
                                {Math.round(lesson.duration_seconds / 60)} min
                              </p>
                            )}
                          </div>
                          <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CourseViewer;
