'use client';
import { usePathname } from 'next/navigation';

export default function NavbarSpacer() {
  const pathname = usePathname();
  
  // No spacer on admin routes because the navbar is hidden there
  if (pathname.startsWith('/admin')) return null;
  
  // No spacer on home page because the hero section is full-bleed and goes under the transparent navbar
  if (pathname === '/') return null;

  // This hardcoded spacer automatically takes care of the navbar space for ALL other pages
  // so you never have to remember to add pt-24 or pt-32 manually again!
  return <div className="h-24 md:h-32 w-full shrink-0" />;
}
