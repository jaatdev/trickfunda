export type SubjectTheme = {
  primary: string; // Used for text, borders
  bgLight: string; // Used for icon background, hover overlay
  gradient: string; // Used for background decorations
  hoverBorder: string; // Tailwind class for hover border
  hoverText: string; // Tailwind class for hover text
  iconColor: string; // Tailwind class for icon color
};

export const getSubjectTheme = (subject: string): SubjectTheme => {
  if (subject.includes('maths')) {
    return {
      primary: 'text-emerald-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      hoverBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/50',
      hoverText: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    };
  }
  if (subject.includes('english')) {
    return {
      primary: 'text-blue-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      hoverBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/50',
      hoverText: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
      iconColor: 'text-blue-500 dark:text-blue-400',
    };
  }
  if (subject.includes('gs')) {
    return {
      primary: 'text-amber-500',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      gradient: 'from-amber-500/20 to-orange-500/20',
      hoverBorder: 'hover:border-amber-500/50 dark:hover:border-amber-500/50',
      hoverText: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
      iconColor: 'text-amber-500 dark:text-amber-400',
    };
  }
  if (subject.includes('reasoning')) {
    return {
      primary: 'text-purple-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      gradient: 'from-purple-500/20 to-pink-500/20',
      hoverBorder: 'hover:border-purple-500/50 dark:hover:border-purple-500/50',
      hoverText: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
      iconColor: 'text-purple-500 dark:text-purple-400',
    };
  }
  if (subject.includes('vocab')) {
    return {
      primary: 'text-rose-500',
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
      gradient: 'from-rose-500/20 to-red-500/20',
      hoverBorder: 'hover:border-rose-500/50 dark:hover:border-rose-500/50',
      hoverText: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
      iconColor: 'text-rose-500 dark:text-rose-400',
    };
  }
  
  // Default fallback
  return {
    primary: 'text-emerald-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    hoverBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/50',
    hoverText: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  };
};
