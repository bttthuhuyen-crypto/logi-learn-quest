import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { MentionSuggestion, MentionSuggestionRef } from './MentionSuggestion';

export const mentionSuggestionOptions = {
  char: '@',
  allowSpaces: true,

  items: async ({ query }: { query: string }) => {
    // Items are fetched inside the component via useSearchPosts
    return [];
  },

  render: () => {
    let component: ReactRenderer<MentionSuggestionRef>;
    let popup: TippyInstance[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionSuggestion, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate: (props: any) => {
        component.updateProps(props);
        popup[0]?.setProps({ getReferenceClientRect: props.clientRect });
      },

      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          popup[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown(props) ?? false;
      },

      onExit: () => {
        popup[0]?.destroy();
        component.destroy();
      },
    };
  },
};
