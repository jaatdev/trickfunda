'use client';

import { useEffect, useState } from 'react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';

export function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const startGlitch = () => {
      clearInterval(interval);
      iteration = 0;
      
      interval = setInterval(() => {
        setDisplayText((prev) => 
          text
            .split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }
        
        iteration += 1 / 3;
      }, 30);
    };

    startGlitch();

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={`inline-block font-mono ${className}`}>
      {displayText}
    </span>
  );
}
