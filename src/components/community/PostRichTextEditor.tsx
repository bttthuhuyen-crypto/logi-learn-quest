import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PostSelectionModal } from '@/components/community/PostSelectionModal';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  MessageSquare,
} from 'lucide-react';

interface PostRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const PostRichTextEditor: React.FC<PostRichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Chia sẻ suy nghĩ của bạn...',
}) => {
  const { language } = useLanguage();
  const [postModalOpen, setPostModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when content prop changes from outside
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const currentContent = editor.getHTML();
      if (content === '' && currentContent !== '<p></p>') {
        editor.commands.setContent('');
      } else if (content && content !== currentContent && content !== '<p></p>') {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    const url = window.prompt(language === 'vi' ? 'Nhập URL:' : 'Enter URL:');
    if (url && editor) {
      if (editor.state.selection.empty) {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor, language]);

  const removeLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const addCommunityLink = useCallback((postId: string, postTitle: string) => {
    if (editor) {
      const linkHtml = `<a href="/community/post/${postId}" target="_blank">${postTitle}</a>`;
      editor.chain().focus().insertContent(linkHtml).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Compact Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${editor.isActive('bold') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${editor.isActive('italic') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${editor.isActive('underline') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${editor.isActive('bulletList') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${editor.isActive('orderedList') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${editor.isActive('link') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          onClick={editor.isActive('link') ? removeLink : addLink}
          title={language === 'vi' ? 'Chèn liên kết' : 'Insert link'}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-7 w-7 text-muted-foreground hover:text-foreground`}
          onClick={() => setPostModalOpen(true)}
          title={language === 'vi' ? 'Link bài viết cộng đồng' : 'Link community post'}
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[120px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />

      {/* Post Selection Modal */}
      <PostSelectionModal
        open={postModalOpen}
        onOpenChange={setPostModalOpen}
        onSelectPost={addCommunityLink}
      />
    </div>
  );
};