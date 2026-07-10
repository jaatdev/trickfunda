'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AppTheme } from '@/hooks/useAppTheme';

interface MagneticNavLinkProps {
  href: string;
  label: string;
  theme: AppTheme;
  showBadge?: boolean;
}

export default function MagneticNavLink({ href, label, theme, showBadge }: MagneticNavLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <Link
        href={href}
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        className="px-4 py-2 rounded-xl text-sm font-bold text-gray-300 transition-colors hover:text-white relative group flex items-center justify-center overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-1">
          {label}
          {showBadge && (
            <span 
              className={`w-1.5 h-1.5 rounded-full ${theme.accentBg} absolute -top-0 -right-2 opacity-80`}
              style={{ boxShadow: `0 0 10px ${theme.navGlowHex}` }}
            />
          )}
        </span>
        
        {/* Hover Highlight (HUD scanning line) */}
        <span 
          className={`absolute bottom-0 left-0 w-full h-[2px] ${theme.accentBg} translate-y-[2px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300`}
          style={{ boxShadow: `0 -2px 10px ${theme.navGlowHex}` }}
        />
        
        {/* Subtle Background Glow on Hover */}
        <span 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at center, ${theme.navGlowHex} 0%, transparent 70%)` }}
        />
      </Link>
    </motion.div>
  );
}
