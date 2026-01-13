import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/i18n/LanguageContext';
import { Course, CourseSection, CourseLesson } from '@/hooks/useCourses';
import { AddSectionModal } from './AddSectionModal';
import { AddLessonModal } from './AddLessonModal';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  FileText,
  Clock,
  Globe,
  Users,
  Award
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CourseSidebarProps {
  course: Course;
  sections: CourseSection[];
  selectedLesson: CourseLesson | null;
  onSelectLesson: (lesson: CourseLesson) => void;
  onUpdateCourse: (updates: Partial<Course>) => Promise<{ error: Error | null }>;
  onCreateSection: (title: string) => Promise<{ data?: unknown; error: Error | null }>;
  onUpdateSection: (sectionId: string, updates: Partial<CourseSection>) => Promise<{ error: Error | null }>;
  onDeleteSection: (sectionId: string) => Promise<{ error: Error | null }>;
  onCreateLesson: (sectionId: string, lesson: Partial<CourseLesson>) => Promise<{ data?: unknown; error: Error | null }>;
  onUpdateLesson: (lessonId: string, updates: Partial<CourseLesson>) => Promise<{ error: Error | null }>;
  onDeleteLesson: (lessonId: string) => Promise<{ error: Error | null }>;
  onEditCourse: () => void;
  onDeleteCourse: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  sections,
  selectedLesson,
  onSelectLesson,
  onUpdateCourse,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onEditCourse,
  onDeleteCourse
}) => {
  const { language } = useLanguage();
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'section' | 'lesson'; id: string } | null>(null);

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const totalDuration = sections.reduce((acc, s) => 
    acc + (s.lessons?.reduce((a, l) => a + l.duration_seconds, 0) || 0), 0
  );

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public': return Globe;
      case 'member': return Users;
      case 'level': return Award;
      default: return Users;
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleAddLesson = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setAddLessonOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'section') {
      await onDeleteSection(deleteConfirm.id);
    } else {
      await onDeleteLesson(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="w-80 border-r bg-card overflow-y-auto h-full">
      {/* Course Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg line-clamp-2">{course.title}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {language === 'vi' ? `Số lượng: ${totalLessons} bài` : `Lessons: ${totalLessons}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(totalDuration)}
          </span>
        </div>
        {course.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
        )}

        {/* Course Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onEditCourse}>
            <Pencil className="h-3 w-3 mr-1" />
            {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
          </Button>
          <Button variant="outline" size="sm" onClick={onDeleteCourse} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3 mr-1" />
            {language === 'vi' ? 'Xóa' : 'Delete'}
          </Button>
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-sm">{language === 'vi' ? 'Xuất bản' : 'Published'}</span>
          <Switch
            checked={course.is_published}
            onCheckedChange={(checked) => onUpdateCourse({ is_published: checked })}
          />
        </div>
      </div>

      {/* Add Section Button */}
      <div className="p-2 border-b">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setAddSectionOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === 'vi' ? 'THÊM DANH MỤC' : 'ADD SECTION'}
        </Button>
      </div>

      {/* Sections List */}
      <div className="p-2 space-y-2">
        {sections.map((section) => (
          <Collapsible
            key={section.id}
            open={expandedSections[section.id] !== false}
            onOpenChange={() => toggleSection(section.id)}
          >
            <div className="bg-primary/10 rounded-lg overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary/20">
                  <div className="flex items-center gap-2">
                    {expandedSections[section.id] !== false ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {/* Section Meta */}
                <div className="px-3 pb-2 text-xs text-muted-foreground">
                  <span>{language === 'vi' ? `${section.lessons?.length || 0} bài` : `${section.lessons?.length || 0} lessons`}</span>
                </div>

                {/* Section Actions */}
                <div className="px-3 pb-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTitle = window.prompt(language === 'vi' ? 'Tên mới:' : 'New name:', section.title);
                      if (newTitle) onUpdateSection(section.id, { title: newTitle });
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    {language === 'vi' ? 'Sửa' : 'Edit'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ type: 'section', id: section.id });
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {language === 'vi' ? 'Xóa' : 'Delete'}
                  </Button>
                </div>

                {/* Add Lesson Button */}
                <div className="px-3 pb-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddLesson(section.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {language === 'vi' ? 'THÊM BÀI HỌC' : 'ADD LESSON'}
                  </Button>
                </div>

                {/* Lessons List */}
                <div className="space-y-1 pb-2">
                  {section.lessons?.map((lesson) => {
                    const AccessIcon = getAccessIcon(lesson.access_level);
                    return (
                      <div
                        key={lesson.id}
                        className={`mx-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedLesson?.id === lesson.id
                            ? 'border-primary bg-background'
                            : 'border-transparent bg-background/50 hover:bg-background'
                        }`}
                        onClick={() => onSelectLesson(lesson)}
                      >
                        <div className="flex items-start gap-2">
                          {lesson.thumbnail_url ? (
                            <img
                              src={lesson.thumbnail_url}
                              alt=""
                              className="w-12 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                <AccessIcon className="h-2.5 w-2.5 mr-0.5" />
                                {lesson.access_level.toUpperCase()}
                              </Badge>
                              <GripVertical className="h-3 w-3 text-muted-foreground ml-auto" />
                            </div>
                            <p className="text-sm font-medium line-clamp-1 mt-1">{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[10px] px-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectLesson(lesson);
                                }}
                              >
                                <Pencil className="h-2.5 w-2.5 mr-0.5" />
                                {language === 'vi' ? 'Sửa' : 'Edit'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[10px] px-1 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({ type: 'lesson', id: lesson.id });
                                }}
                              >
                                <Trash2 className="h-2.5 w-2.5 mr-0.5" />
                                {language === 'vi' ? 'Xóa' : 'Delete'}
                              </Button>
                              <div className="flex items-center gap-1 ml-auto">
                                <span className="text-[10px] text-muted-foreground">
                                  {language === 'vi' ? 'Xuất bản' : 'Publish'}
                                </span>
                                <Switch
                                  checked={lesson.is_published}
                                  onCheckedChange={(checked) => onUpdateLesson(lesson.id, { is_published: checked })}
                                  className="scale-75"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {/* Modals */}
      <AddSectionModal
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
        onSubmit={onCreateSection}
      />

      <AddLessonModal
        open={addLessonOpen}
        onOpenChange={setAddLessonOpen}
        onSubmit={(lesson) => activeSectionId ? onCreateLesson(activeSectionId, lesson) : Promise.resolve({ error: null })}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'vi' 
                ? `Xóa ${deleteConfirm?.type === 'section' ? 'danh mục' : 'bài học'}?`
                : `Delete ${deleteConfirm?.type}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'vi'
                ? 'Hành động này không thể hoàn tác.'
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'vi' ? 'Hủy' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              {language === 'vi' ? 'Xóa' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
