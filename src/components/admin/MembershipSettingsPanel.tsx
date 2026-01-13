import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAdminQuestions } from '@/hooks/useAdminQuestions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { EditQuestionModal } from './EditQuestionModal';
import { MembershipQuestion } from '@/hooks/useMembership';
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
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

export const MembershipSettingsPanel: React.FC = () => {
  const { language } = useLanguage();
  const {
    questions,
    questionsEnabled,
    autoApprove,
    loading,
    updateSetting,
    addQuestion,
    updateQuestion,
    deleteQuestion
  } = useAdminQuestions();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<MembershipQuestion | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleToggleEnabled = async (checked: boolean) => {
    setSaving(true);
    const { error } = await updateSetting('membership_questions_enabled', checked);
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    }
    setSaving(false);
  };

  const handleToggleAutoApprove = async (checked: boolean) => {
    setSaving(true);
    const { error } = await updateSetting('auto_approve', checked);
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    }
    setSaving(false);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setEditModalOpen(true);
  };

  const handleEditQuestion = (question: MembershipQuestion) => {
    setEditingQuestion(question);
    setEditModalOpen(true);
  };

  const handleSaveQuestion = async (question: Omit<MembershipQuestion, 'id'> | MembershipQuestion) => {
    if ('id' in question && question.id) {
      const { error } = await updateQuestion(question.id, question);
      if (error) {
        toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
        return;
      }
      toast.success(language === 'vi' ? 'Đã cập nhật câu hỏi' : 'Question updated');
    } else {
      const { error } = await addQuestion(question as Omit<MembershipQuestion, 'id'>);
      if (error) {
        toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
        return;
      }
      toast.success(language === 'vi' ? 'Đã thêm câu hỏi' : 'Question added');
    }
    setEditModalOpen(false);
  };

  const handleDeleteClick = (questionId: string) => {
    setDeletingQuestionId(questionId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestionId) return;
    const { error } = await deleteQuestion(deletingQuestionId);
    if (error) {
      toast.error(language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred');
    } else {
      toast.success(language === 'vi' ? 'Đã xóa câu hỏi' : 'Question deleted');
    }
    setDeleteConfirmOpen(false);
    setDeletingQuestionId(null);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return language === 'vi' ? 'Văn bản' : 'Text';
      case 'multiple_choice':
        return language === 'vi' ? 'Trắc nghiệm' : 'Multiple Choice';
      case 'email':
        return 'Email';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'vi' ? 'Cài đặt câu hỏi gia nhập' : 'Membership Questions Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">
                {language === 'vi' ? 'Bật câu hỏi gia nhập' : 'Enable membership questions'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'vi' 
                  ? 'Yêu cầu người dùng trả lời câu hỏi trước khi gia nhập'
                  : 'Require users to answer questions before joining'}
              </p>
            </div>
            <Switch
              checked={questionsEnabled}
              onCheckedChange={handleToggleEnabled}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">
                {language === 'vi' ? 'Tự động duyệt' : 'Auto-approve'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'vi' 
                  ? 'Khi bật, thành viên sẽ được tự động duyệt sau khi trả lời'
                  : 'When enabled, members will be auto-approved after answering'}
              </p>
            </div>
            <Switch
              checked={autoApprove}
              onCheckedChange={handleToggleAutoApprove}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {language === 'vi' ? 'Danh sách câu hỏi' : 'Questions List'}
          </CardTitle>
          <Button
            onClick={handleAddQuestion}
            disabled={questions.length >= 3}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            {language === 'vi' ? 'Thêm câu hỏi' : 'Add Question'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {language === 'vi' ? 'Chưa có câu hỏi nào' : 'No questions yet'}
            </p>
          ) : (
            questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-start gap-3 p-4 border rounded-lg"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-move" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {language === 'vi' ? `Câu hỏi ${index + 1}` : `Question ${index + 1}`}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded">
                      {getQuestionTypeLabel(question.question_type)}
                    </span>
                  </div>
                  <p className="font-medium">{question.question_text}</p>
                  {question.question_text_en && (
                    <p className="text-sm text-muted-foreground">{question.question_text_en}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(question.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          
          {questions.length >= 3 && (
            <p className="text-sm text-muted-foreground text-center">
              {language === 'vi' ? 'Đã đạt tối đa 3 câu hỏi' : 'Maximum 3 questions reached'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditQuestionModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        question={editingQuestion}
        onSave={handleSaveQuestion}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'vi' ? 'Xóa câu hỏi?' : 'Delete question?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'vi' 
                ? 'Hành động này không thể hoàn tác. Câu hỏi sẽ bị xóa vĩnh viễn.'
                : 'This action cannot be undone. The question will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              {language === 'vi' ? 'Xóa' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
