import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCourses, Course } from '@/hooks/useCourses';
import { useUserRole } from '@/hooks/useUserRole';
import { CourseCard } from '@/components/classroom/CourseCard';
import { CreateCourseModal } from '@/components/classroom/CreateCourseModal';
import { CoursePaymentModal } from '@/components/classroom/CoursePaymentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Classroom = () => {
  const { language } = useLanguage();
  const { courses, loading, createCourse } = useCourses();
  const { isAdmin } = useUserRole();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCreateCourse = async (course: Parameters<typeof createCourse>[0]) => {
    const { error } = await createCourse(course);
    if (error) {
      toast.error(language === 'vi' ? 'Lỗi tạo khóa học' : 'Error creating course');
    } else {
      toast.success(language === 'vi' ? 'Đã tạo khóa học' : 'Course created');
    }
  };

  const handleLockedCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setPaymentModalOpen(true);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">
            {language === 'vi' ? 'Học tập' : 'Classroom'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'vi' ? 'Tìm kiếm...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Label htmlFor="edit-mode" className="text-sm">
                  {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                </Label>
                <Switch id="edit-mode" checked={editMode} onCheckedChange={setEditMode} />
              </div>
            )}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Course Card - Admin Only */}
          {isAdmin && (
            <div
              className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary/50 transition-colors min-h-[280px]"
              onClick={() => setCreateModalOpen(true)}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">{language === 'vi' ? 'Tạo khóa học' : 'Create Course'}</p>
            </div>
          )}

          {/* Course Cards */}
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              isEditMode={isAdmin && editMode}
              onLockedClick={handleLockedCourseClick}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <p className="text-center text-muted-foreground mt-8">
            {language === 'vi' ? 'Chưa có khóa học nào' : 'No courses yet'}
          </p>
        )}
      </div>

      <CreateCourseModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateCourse}
      />

      <CoursePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        course={selectedCourse}
      />
    </MainLayout>
  );
};

export default Classroom;
