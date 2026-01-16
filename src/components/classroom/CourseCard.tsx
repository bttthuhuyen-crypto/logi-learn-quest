import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/hooks/useCourses';
import { useLanguage } from '@/i18n/LanguageContext';
import { BookOpen, Lock } from 'lucide-react';
import { useCourseAccess } from '@/hooks/useCourseAccess';

interface CourseCardProps {
  course: Course;
  isEditMode?: boolean;
  onLockedClick?: (course: Course) => void;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, isEditMode, onLockedClick }) => {
  const { language } = useLanguage();
  const { hasAccess, isLoading } = useCourseAccess(course.id, course.is_paid);

  const isLocked = course.is_paid && !hasAccess && !isLoading;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked && onLockedClick) {
      e.preventDefault();
      onLockedClick(course);
    }
  };

  const cardContent = (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors group cursor-pointer h-full">
      {/* Thumbnail */}
      <div className="relative aspect-[2/1] bg-muted">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className={`w-full h-full object-cover transition-all ${isLocked ? 'brightness-50' : ''}`}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 ${isLocked ? 'brightness-50' : ''}`}>
            <BookOpen className="h-12 w-12 text-primary/30" />
          </div>
        )}
        
        {/* Lock Overlay for Paid Courses */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium px-3 py-1 rounded-full bg-black/60">
              {language === 'vi' ? 'Mở khóa ' : 'Unlock for '}
              {formatCurrency(course.price)}
            </span>
          </div>
        )}
        
        {/* Badges - Only show when not locked */}
        {!isLocked && (
          <div className="absolute top-2 left-2 flex gap-2">
            {!course.is_published && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {language === 'vi' ? 'Bản nháp' : 'Draft'}
              </Badge>
            )}
            {course.is_paid && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {language === 'vi' ? 'Trả phí' : 'Paid'}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {course.description}
          </p>
        )}
        {isLocked && (
          <p className="text-sm text-primary font-medium mt-2">
            {formatCurrency(course.price)}
          </p>
        )}
      </CardContent>
    </Card>
  );

  // If locked, don't navigate - just trigger the click handler
  if (isLocked) {
    return (
      <div onClick={handleClick}>
        {cardContent}
      </div>
    );
  }

  // Normal navigation for unlocked courses
  return (
    <a href={isEditMode ? `/classroom/edit/${course.id}` : `/classroom/${course.id}`}>
      {cardContent}
    </a>
  );
};
