import Mention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/core';
import { mentionSuggestionOptions } from './mentionSuggestion';

export const PostMention = Mention.extend({
  name: 'postMention',

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(
        {
          href: `/community/post/${node.attrs.id}`,
          class: 'mention',
          'data-mention': '',
          'data-id': node.attrs.id,
        },
        HTMLAttributes
      ),
      `@${node.attrs.label}`,
    ];
  },

  parseHTML() {
    return [{ tag: 'a[data-mention]' }];
  },
}).configure({
  suggestion: mentionSuggestionOptions,
});
