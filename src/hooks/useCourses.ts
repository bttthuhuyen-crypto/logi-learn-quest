import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_paid: boolean;
  price: number;
  is_published: boolean;
  cta_text: string;
  introduction_content: string | null;
  order_index: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  section_id: string;
  title: string;
  content: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  access_level: 'public' | 'member' | 'level';
  required_level: number;
  is_published: boolean;
  duration_seconds: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('order_index');

    if (!error && data) {
      setCourses(data as Course[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const createCourse = async (course: Partial<Course>) => {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        is_paid: course.is_paid || false,
        price: course.price || 0,
        order_index: courses.length
      })
      .select()
      .single();

    if (!error && data) {
      await fetchCourses();
    }
    return { data, error };
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id);

    if (!error) {
      await fetchCourses();
    }
    return { error };
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchCourses();
    }
    return { error };
  };

  const reorderCourses = async (reorderedCourses: Course[]) => {
    const updates = reorderedCourses.map((course, index) => ({
      id: course.id,
      order_index: index
    }));

    for (const update of updates) {
      await supabase
        .from('courses')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }

    setCourses(reorderedCourses);
  };

  return {
    courses,
    loading,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    reorderCourses
  };
};

export const useCourseDetail = (courseId: string | undefined) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    if (!courseId) return;
    
    setLoading(true);
    
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (courseData) {
      setCourse(courseData as Course);
    }

    const { data: sectionsData } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (sectionsData) {
      // Fetch lessons for each section
      const sectionsWithLessons = await Promise.all(
        sectionsData.map(async (section) => {
          const { data: lessons } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('section_id', section.id)
            .order('order_index');

          return {
            ...section,
            lessons: (lessons || []).map(l => ({
              ...l,
              access_level: l.access_level as 'public' | 'member' | 'level'
            }))
          } as CourseSection;
        })
      );

      setSections(sectionsWithLessons);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const updateCourse = async (updates: Partial<Course>) => {
    if (!courseId) return { error: new Error('No course ID') };

    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId);

    if (!error) {
      setCourse(prev => prev ? { ...prev, ...updates } : null);
    }
    return { error };
  };

  // Section management
  const createSection = async (title: string) => {
    if (!courseId) return { error: new Error('No course ID') };

    const { data, error } = await supabase
      .from('course_sections')
      .insert({
        course_id: courseId,
        title,
        order_index: sections.length
      })
      .select()
      .single();

    if (!error) {
      await fetchCourse();
    }
    return { data, error };
  };

  const updateSection = async (sectionId: string, updates: Partial<CourseSection>) => {
    const { error } = await supabase
      .from('course_sections')
      .update(updates)
      .eq('id', sectionId);

    if (!error) {
      await fetchCourse();
    }
    return { error };
  };

  const deleteSection = async (sectionId: string) => {
    const { error } = await supabase
      .from('course_sections')
      .delete()
      .eq('id', sectionId);

    if (!error) {
      await fetchCourse();
    }
    return { error };
  };

  // Lesson management
  const createLesson = async (sectionId: string, lesson: Partial<CourseLesson>) => {
    const section = sections.find(s => s.id === sectionId);
    const lessonCount = section?.lessons?.length || 0;

    const { data, error } = await supabase
      .from('course_lessons')
      .insert({
        section_id: sectionId,
        title: lesson.title,
        access_level: lesson.access_level || 'member',
        required_level: lesson.required_level || 1,
        thumbnail_url: lesson.thumbnail_url,
        order_index: lessonCount
      })
      .select()
      .single();

    if (!error) {
      await fetchCourse();
    }
    return { data, error };
  };

  const updateLesson = async (lessonId: string, updates: Partial<CourseLesson>) => {
    const { error } = await supabase
      .from('course_lessons')
      .update(updates)
      .eq('id', lessonId);

    if (!error) {
      await fetchCourse();
    }
    return { error };
  };

  const deleteLesson = async (lessonId: string) => {
    const { error } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', lessonId);

    if (!error) {
      await fetchCourse();
    }
    return { error };
  };

  return {
    course,
    sections,
    loading,
    fetchCourse,
    updateCourse,
    createSection,
    updateSection,
    deleteSection,
    createLesson,
    updateLesson,
    deleteLesson
  };
};

export const uploadCourseAsset = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('course-assets')
    .upload(path, file, { upsert: true });

  if (error) return { url: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('course-assets')
    .getPublicUrl(path);

  return { url: publicUrl, error: null };
};
