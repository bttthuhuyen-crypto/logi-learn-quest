import DOMPurify from 'dompurify';

// Configure allowed tags and attributes for rich text content
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'hr', 'img', 'span', 'div'
];

const ALLOWED_ATTR = ['href', 'class', 'target', 'rel', 'src', 'alt', 'title', 'style'];

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated HTML content before rendering with dangerouslySetInnerHTML
 */
export const sanitizeHtml = (dirty: string | null | undefined): string => {
  if (!dirty) return '';
  
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
  
  // Post-process to ensure links are safe
  return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
};

/**
 * Sanitize plain text - strips all HTML tags
 */
export const sanitizePlainText = (dirty: string | null | undefined): string => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};
