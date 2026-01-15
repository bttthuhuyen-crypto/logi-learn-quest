import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Play, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CourseSection, CourseLesson } from '@/hooks/useCourses';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LessonSidebarProps {
  sections: CourseSection[];
  courseId: string;
  currentLessonId?: string;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  sections,
  courseId,
  currentLessonId
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

  // Initialize all sections as open
  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(s => {
      initial[s.id] = true;
    });
    setOpenSections(initial);
  }, [sections]);

  // Fetch completed lessons
  const { data: completedLessons = [] } = useQuery({
    queryKey: ['completed-lessons', courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const allLessonIds = sections.flatMap(s => s.lessons?.map(l => l.id) || []);
      
      if (allLessonIds.length === 0) return [];

      const { data } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .in('lesson_id', allLessonIds);

      return data?.map(p => p.lesson_id) || [];
    },
    enabled: !!user?.id && sections.length > 0,
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  return (
    <aside className="w-80 border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">
          {language === 'vi' ? 'Nội dung khóa học' : 'Course Content'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {completedLessons.length} / {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)}{' '}
          {language === 'vi' ? 'bài học' : 'lessons'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {sections.map((section, sectionIndex) => (
            <Collapsible
              key={section.id}
              open={openSections[section.id]}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {sectionIndex + 1}
                  </span>
                  <span className="font-medium">{section.title}</span>
                </div>
                {openSections[section.id] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="ml-4 space-y-1">
                      {section.lessons?.map((lesson, lessonIndex) => {
                        const completed = isCompleted(lesson.id);
                        const isCurrent = currentLessonId === lesson.id;
                        const isLocked = !lesson.is_published;

                    return (
                      <Link
                        key={lesson.id}
                        to={isLocked ? '#' : `/classroom/${courseId}/lesson/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                          isCurrent && "bg-primary/10 border border-primary/20",
                          !isCurrent && !isLocked && "hover:bg-muted/50",
                          isLocked && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={(e) => isLocked && e.preventDefault()}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                          completed && "bg-green-500 text-white",
                          isCurrent && !completed && "bg-primary text-primary-foreground",
                          !completed && !isCurrent && "bg-muted text-muted-foreground"
                        )}>
                          {completed ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : isLocked ? (
                            <Lock className="h-3 w-3" />
                          ) : isCurrent ? (
                            <Play className="h-3 w-3" />
                          ) : (
                            lessonIndex + 1
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            isCurrent && "font-medium",
                            completed && "text-muted-foreground"
                          )}>
                            {lesson.title}
                          </p>
                          {lesson.duration_seconds && (
                            <p className="text-xs text-muted-foreground">
                              {Math.round(lesson.duration_seconds / 60)} min
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};
