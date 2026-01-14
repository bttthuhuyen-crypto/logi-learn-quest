import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from './RichTextEditor';
import { useLanguage } from '@/i18n/LanguageContext';
import { Course, CourseLesson } from '@/hooks/useCourses';
import { Monitor, Smartphone, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitize';

interface CourseContentEditorProps {
  course: Course;
  selectedLesson: CourseLesson | null;
  onUpdateCourse: (updates: Partial<Course>) => Promise<{ error: Error | null }>;
  onUpdateLesson: (lessonId: string, updates: Partial<CourseLesson>) => Promise<{ error: Error | null }>;
}

export const CourseContentEditor: React.FC<CourseContentEditorProps> = ({
  course,
  selectedLesson,
  onUpdateCourse,
  onUpdateLesson
}) => {
  const { language } = useLanguage();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [ctaText, setCtaText] = useState(course.cta_text || 'VÀO HỌC NGAY');
  const [introContent, setIntroContent] = useState(course.introduction_content || '');
  const [lessonContent, setLessonContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingIntro, setEditingIntro] = useState(false);

  useEffect(() => {
    setCtaText(course.cta_text || 'VÀO HỌC NGAY');
    setIntroContent(course.introduction_content || '');
  }, [course]);

  useEffect(() => {
    if (selectedLesson) {
      setLessonContent(selectedLesson.content || '');
    }
  }, [selectedLesson]);

  const handleSaveCTA = async () => {
    setSaving(true);
    const { error } = await onUpdateCourse({ cta_text: ctaText });
    if (error) {
      toast.error(language === 'vi' ? 'Lỗi lưu' : 'Error saving');
    } else {
      toast.success(language === 'vi' ? 'Đã lưu' : 'Saved');
    }
    setSaving(false);
  };

  const handleSaveIntro = async () => {
    setSaving(true);
    const { error } = await onUpdateCourse({ introduction_content: introContent });
    if (error) {
      toast.error(language === 'vi' ? 'Lỗi lưu' : 'Error saving');
    } else {
      toast.success(language === 'vi' ? 'Đã lưu' : 'Saved');
      setEditingIntro(false);
    }
    setSaving(false);
  };

  const handleSaveLessonContent = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    const { error } = await onUpdateLesson(selectedLesson.id, { content: lessonContent });
    if (error) {
      toast.error(language === 'vi' ? 'Lỗi lưu' : 'Error saving');
    } else {
      toast.success(language === 'vi' ? 'Đã lưu' : 'Saved');
    }
    setSaving(false);
  };

  const handleClearIntro = async () => {
    setSaving(true);
    const { error } = await onUpdateCourse({ introduction_content: '' });
    if (error) {
      toast.error(language === 'vi' ? 'Lỗi xóa' : 'Error deleting');
    } else {
      setIntroContent('');
      toast.success(language === 'vi' ? 'Đã xóa' : 'Deleted');
    }
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* CTA Configuration */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-4">
          {language === 'vi' ? 'Cấu hình nút CTA' : 'CTA Button Configuration'}
        </h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>{language === 'vi' ? 'Tên nút' : 'Button Text'}</Label>
            <Input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value.slice(0, 20))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">{ctaText.length}/20</p>
          </div>
          <Button onClick={handleSaveCTA} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (language === 'vi' ? 'LƯU' : 'SAVE')}
          </Button>
        </div>
        <div className="mt-4">
          <Label className="text-muted-foreground">{language === 'vi' ? 'Xem trước:' : 'Preview:'}</Label>
          <div className="mt-2">
            <Button className="bg-primary hover:bg-primary/90">
              {ctaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="intro" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="intro">
              {language === 'vi' ? 'Giới thiệu' : 'Introduction'}
            </TabsTrigger>
            {selectedLesson && (
              <TabsTrigger value="lesson">
                {selectedLesson.title}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Device Preview Toggle */}
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewDevice('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewDevice('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Introduction Tab */}
        <TabsContent value="intro">
          <div className="bg-card border rounded-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {language === 'vi' ? 'Giới thiệu khóa học' : 'Course Introduction'}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingIntro(!editingIntro)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  {language === 'vi' ? 'Sửa nội dung' : 'Edit Content'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearIntro}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {language === 'vi' ? 'Xóa nội dung' : 'Delete Content'}
                </Button>
              </div>
            </div>

            <div className={`p-4 ${previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              {editingIntro ? (
                <div className="space-y-4">
                  <RichTextEditor
                    content={introContent}
                    onChange={setIntroContent}
                    placeholder={language === 'vi' ? 'Hãy mô tả, giới thiệu về khóa học' : 'Describe and introduce the course'}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingIntro(false)}>
                      {language === 'vi' ? 'HỦY BỎ' : 'CANCEL'}
                    </Button>
                    <Button onClick={handleSaveIntro} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {language === 'vi' ? 'LƯU' : 'SAVE'}
                    </Button>
                  </div>
                </div>
              ) : introContent ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(introContent) }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{language === 'vi' ? 'Hãy mô tả, giới thiệu về khóa học' : 'Describe and introduce the course'}</p>
                  <Button variant="link" onClick={() => setEditingIntro(true)} className="mt-2">
                    {language === 'vi' ? 'Thêm nội dung' : 'Add content'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Lesson Content Tab */}
        {selectedLesson && (
          <TabsContent value="lesson">
            <div className="bg-card border rounded-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">{selectedLesson.title}</h3>
                <Button onClick={handleSaveLessonContent} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-1" />
                  {language === 'vi' ? 'Lưu' : 'Save'}
                </Button>
              </div>

              <div className={`p-4 ${previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <RichTextEditor
                  content={lessonContent}
                  onChange={setLessonContent}
                  placeholder={language === 'vi' ? 'Nhập nội dung bài học...' : 'Enter lesson content...'}
                />
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
