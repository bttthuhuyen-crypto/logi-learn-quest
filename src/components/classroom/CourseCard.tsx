import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/hooks/useCourses';
import { useLanguage } from '@/i18n/LanguageContext';
import { BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isEditMode?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isEditMode }) => {
  const { language } = useLanguage();

  return (
    <Link to={isEditMode ? `/classroom/edit/${course.id}` : `/classroom/${course.id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors group cursor-pointer h-full">
        {/* Thumbnail */}
        <div className="relative aspect-[2/1] bg-muted">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="h-12 w-12 text-primary/30" />
            </div>
          )}
          
          {/* Badges */}
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
        </CardContent>
      </Card>
    </Link>
  );
};
