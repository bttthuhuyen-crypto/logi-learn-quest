import { useParams, Navigate } from 'react-router-dom';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';
import Community from '@/pages/Community';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/layout/MainLayout';

function CommunityContent() {
  const { community, isLoading, error } = useCommunity();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-48 w-full rounded-lg mb-6" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (error || !community) {
    return <Navigate to="/discover" replace />;
  }

  // Render the Community page with the current community context
  return <Community />;
}

export default function CommunityRouter() {
  const { communitySlug } = useParams<{ communitySlug: string }>();

  return (
    <CommunityProvider communitySlug={communitySlug}>
      <CommunityContent />
    </CommunityProvider>
  );
}
