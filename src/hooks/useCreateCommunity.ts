import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommunityFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  isPublic: boolean;
  requiresApproval: boolean;
  price: number;
  pricePeriod: 'month' | 'year';
  logo?: File;
  cover?: File;
}

export function useCreateCommunity() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user?.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('community-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('community-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const checkSlugAvailable = async (slug: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return !data;
  };

  const createCommunity = async (data: CommunityFormData) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để tạo cộng đồng');
      navigate('/auth');
      return;
    }

    setIsLoading(true);

    try {
      // Check if slug is available
      const isAvailable = await checkSlugAvailable(data.slug);
      if (!isAvailable) {
        toast.error('URL này đã được sử dụng, vui lòng chọn URL khác');
        setIsLoading(false);
        return;
      }

      // Upload logo if provided
      let logoUrl: string | null = null;
      if (data.logo) {
        logoUrl = await uploadImage(data.logo, 'logos');
      }

      // Upload cover if provided
      let coverUrl: string | null = null;
      if (data.cover) {
        coverUrl = await uploadImage(data.cover, 'covers');
      }

      // Create community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description,
          logo_url: logoUrl,
          cover_image_url: coverUrl,
          category: data.category,
          is_public: data.isPublic,
          requires_approval: data.requiresApproval,
          price: data.price,
          price_period: data.pricePeriod,
          owner_id: user.id,
          member_count: 1,
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // Add owner as member with 'owner' role
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
        });

      if (memberError) throw memberError;

      toast.success('Tạo cộng đồng thành công!');
      navigate(`/c/${community.slug}`);
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCommunity,
    generateSlug,
    checkSlugAvailable,
    isLoading,
  };
}
