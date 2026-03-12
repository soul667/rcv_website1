import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export function BackButton({ onClick, label, theme = 'dark', className = '' }: BackButtonProps) {
  const { language } = useLanguage();
  const defaultLabel = language === 'zh' ? '返回主页' : 'Back to Home';

  const themeClasses =
    theme === 'dark'
      ? 'theme-icon-button hover:text-[color:var(--foreground)]'
      : 'theme-icon-button hover:text-[color:var(--foreground)]';

  return (
    <button
      onClick={onClick}
      className={`mb-4 inline-flex items-center justify-center rounded-full px-5 py-2.5 h-auto text-sm font-medium backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5 outline-none focus:ring-2 focus:ring-indigo-500/50 ${themeClasses} ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
      {label ?? defaultLabel}
    </button>
  );
}
