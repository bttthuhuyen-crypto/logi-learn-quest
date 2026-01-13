import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseDetail, CourseLesson } from '@/hooks/useCourses';
import { CourseSidebar } from '@/components/classroom/CourseSidebar';
import { CourseContentEditor } from '@/components/classroom/CourseContentEditor';
import { useLanguage } from '@/i18n/LanguageContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
import { supabase } from '@/integrations/supabase/client';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    course, sections, loading,
    updateCourse, createSection, updateSection, deleteSection,
    createLesson, updateLesson, deleteLesson
  } = useCourseDetail(id);
  
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteCourse = async () => {
    if (!id) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      toast.error(language === 'vi' ? 'Lỗi xóa khóa học' : 'Error deleting course');
    } else {
      toast.success(language === 'vi' ? 'Đã xóa khóa học' : 'Course deleted');
      navigate('/classroom');
    }
  };

  if (loading || !course) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b bg-background flex items-center px-4 gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/classroom')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold truncate">{course.title}</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <CourseSidebar
          course={course}
          sections={sections}
          selectedLesson={selectedLesson}
          onSelectLesson={setSelectedLesson}
          onUpdateCourse={updateCourse}
          onCreateSection={createSection}
          onUpdateSection={updateSection}
          onDeleteSection={deleteSection}
          onCreateLesson={createLesson}
          onUpdateLesson={updateLesson}
          onDeleteLesson={deleteLesson}
          onEditCourse={() => toast.info('Edit modal coming soon')}
          onDeleteCourse={() => setDeleteConfirmOpen(true)}
        />
        <CourseContentEditor
          course={course}
          selectedLesson={selectedLesson}
          onUpdateCourse={updateCourse}
          onUpdateLesson={updateLesson}
        />
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'vi' ? 'Xóa khóa học?' : 'Delete course?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'vi' ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'vi' ? 'Hủy' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive">
              {language === 'vi' ? 'Xóa' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseEditor;
