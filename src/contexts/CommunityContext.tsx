import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Community {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  member_count: number;
  is_public: boolean;
  category: string | null;
  price: number;
  price_period: string;
  created_at: string;
}

interface CommunityContextType {
  community: Community | null;
  communityId: string;
  isLoading: boolean;
  error: Error | null;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

// Default community ID (10X Logistics)
const DEFAULT_COMMUNITY_ID = '00000000-0000-0000-0000-000000000001';

interface CommunityProviderProps {
  children: ReactNode;
  communitySlug?: string;
}

export function CommunityProvider({ children, communitySlug }: CommunityProviderProps) {
  const { data: community, isLoading, error } = useQuery({
    queryKey: ['community', communitySlug],
    queryFn: async () => {
      if (!communitySlug) {
        // Return default community
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .eq('id', DEFAULT_COMMUNITY_ID)
          .single();

        if (error) throw error;
        return data as Community;
      }

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', communitySlug)
        .single();

      if (error) throw error;
      return data as Community;
    },
    enabled: true,
  });

  const value: CommunityContextType = {
    community: community || null,
    communityId: community?.id || DEFAULT_COMMUNITY_ID,
    isLoading,
    error: error as Error | null,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    // Return default values if not wrapped in provider
    return {
      community: null,
      communityId: DEFAULT_COMMUNITY_ID,
      isLoading: false,
      error: null,
    };
  }
  return context;
}

export { DEFAULT_COMMUNITY_ID };
