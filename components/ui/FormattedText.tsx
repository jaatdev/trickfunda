import React from 'react';
import katex from 'katex';

interface FormattedTextProps {
  /**
   * The text string containing HTML formatting tags (like <b>, <u>, <i>)
   * and Math (like $x^2$ or $$x^2$$).
   */
  text: string;
  /**
   * Optional CSS class names to apply to the wrapper element
   */
  className?: string;
  /**
   * The HTML element or React component to render as the wrapper. Defaults to "span".
   */
  as?: React.ElementType;
}

/**
 * Replaces math blocks in a string with synchronous KaTeX HTML strings.
 */
function processMathAndHtml(text: string): string {
  if (!text) return text;
  
  // Replace block math $$...$$
  let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // Replace inline math $...$
  processed = processed.replace(/\$((?:\\.|[^$])*?)\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // MathJax fallback for \( \) and \[ \]
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });
  
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  return processed;
}

/**
 * A reusable component to render strings that contain HTML formatting tags and Math.
 * Renders Math synchronously to avoid FOUT (Flash of Unstyled Text).
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ 
  text, 
  className = "", 
  as: Component = "span" 
}) => {
  if (!text) return null;
  
  const processedHtml = processMathAndHtml(text);
  
  return (
    <Component 
      className={className} 
      dangerouslySetInnerHTML={{ __html: processedHtml }} 
    />
  );
};

export default FormattedText;
