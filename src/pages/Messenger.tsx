import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { ConversationList } from '@/components/messenger/ConversationList';
import { ChatWindow } from '@/components/messenger/ChatWindow';
import { EmptyChat } from '@/components/messenger/EmptyChat';
import { NewConversationModal } from '@/components/messenger/NewConversationModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const Messenger: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const isMobile = useIsMobile();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationId || null
  );
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [showChat, setShowChat] = useState(!!conversationId);

  const { conversations, isLoading, createConversation } = useConversations();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Sync URL param with state
  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
      setShowChat(true);
    }
  }, [conversationId]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChat(true);
    navigate(`/messages/${id}`);
  };

  const handleBack = () => {
    setShowChat(false);
    navigate('/messages');
  };

  const handleCreateConversation = async (userId: string) => {
    try {
      const result = await createConversation.mutateAsync(userId);
      handleSelectConversation(result.id);
      if (result.isNew) {
        toast.success('Đã tạo cuộc trò chuyện mới');
      }
    } catch (error) {
      toast.error('Không thể tạo cuộc trò chuyện');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Mobile view: show either list or chat
  if (isMobile) {
    return (
      <MainLayout hideHeader={showChat}>
        <div className="h-[calc(100vh-4rem)]">
          {showChat && selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user.id}
              onBack={handleBack}
              isMobile
            />
          ) : (
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              selectedId={selectedConversationId}
              onSelect={handleSelectConversation}
              onNewConversation={() => setShowNewConversationModal(true)}
              currentUserId={user.id}
            />
          )}
        </div>

        <NewConversationModal
          open={showNewConversationModal}
          onOpenChange={setShowNewConversationModal}
          onSelectUser={handleCreateConversation}
        />
      </MainLayout>
    );
  }

  // Desktop view: side-by-side layout
  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation list sidebar */}
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
            onNewConversation={() => setShowNewConversationModal(true)}
            currentUserId={user.id}
          />
        </div>

        {/* Chat window */}
        <div className="flex-1">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <EmptyChat />
          )}
        </div>
      </div>

      <NewConversationModal
        open={showNewConversationModal}
        onOpenChange={setShowNewConversationModal}
        onSelectUser={handleCreateConversation}
      />
    </MainLayout>
  );
};

export default Messenger;
