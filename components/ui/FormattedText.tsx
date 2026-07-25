import React from 'react';

interface FormattedTextProps {
  /**
   * The text string containing HTML formatting tags (like <b>, <u>, <i>)
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
 * A reusable component to render strings that contain HTML formatting tags.
 * Use this when you have text from a JSON file that includes formatting like <u> or <b>.
 * 
 * @example
 * <FormattedText text="The <b>dog</b> ran to the <u>park</u>." />
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ 
  text, 
  className = "", 
  as: Component = "span" 
}) => {
  if (!text) return null;
  
  return (
    <Component 
      className={className} 
      dangerouslySetInnerHTML={{ __html: text }} 
    />
  );
};

export default FormattedText;
