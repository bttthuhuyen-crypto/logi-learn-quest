import React from 'react';
import { Course } from '@/hooks/useCourses';
import { useLanguage } from '@/i18n/LanguageContext';
import { BookOpen } from 'lucide-react';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  course: Course;
  isEditMode?: boolean;
  onLockedClick?: (course: Course) => void;
}

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return 'Free';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Get category badge color based on course type or price
const getCategoryBadge = (course: Course, language: string) => {
  if (!course.is_paid) {
    return {
      label: language === 'vi' ? 'MIỄN PHÍ' : 'FREE',
      bgColor: 'bg-emerald-500',
    };
  }
  // Default paid course badge
  return {
    label: language === 'vi' ? 'KHÓA HỌC' : 'COURSE',
    bgColor: 'bg-sky-500',
  };
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, isEditMode, onLockedClick }) => {
  const { language } = useLanguage();
  const { hasAccess, isLoading } = useCourseAccess(course.id, course.is_paid);

  const isLocked = course.is_paid && !hasAccess && !isLoading;
  const categoryBadge = getCategoryBadge(course, language);

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLocked && onLockedClick) {
      onLockedClick(course);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      if (onLockedClick) {
        onLockedClick(course);
      }
    }
  };

  const cardContent = (
    <div className="group h-full">
      {/* Thumbnail with Category Badge */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <BookOpen className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${categoryBadge.bgColor} text-white text-xs font-semibold px-3 py-1.5 rounded-md`}>
            {categoryBadge.label}
          </span>
        </div>

        {/* Draft Badge */}
        {!course.is_published && (
          <div className="absolute top-3 right-3">
            <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md">
              {language === 'vi' ? 'Bản nháp' : 'Draft'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-1">
        {/* Title */}
        <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
        )}

        {/* Price and CTA Button */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-foreground">
            {course.is_paid ? formatCurrency(course.price) : 'Free'}
          </span>
          
          <Button 
            onClick={isLocked ? handleEnrollClick : undefined}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2 rounded-md"
          >
            {language === 'vi' ? 'Đăng ký ngay' : 'Enroll Now'}
          </Button>
        </div>
      </div>
    </div>
  );

  // If locked, don't navigate - just show the card with click handler
  if (isLocked) {
    return (
      <div onClick={handleCardClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  // Normal navigation for unlocked courses
  return (
    <a href={isEditMode ? `/classroom/edit/${course.id}` : `/classroom/${course.id}`} className="block">
      {cardContent}
    </a>
  );
};
