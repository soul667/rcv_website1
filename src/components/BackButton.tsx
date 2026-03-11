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
      ? 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30'
      : 'text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300';

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`mb-8 rounded-full px-5 py-2 h-auto text-sm font-medium transition-all duration-200 ${themeClasses} ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {label ?? defaultLabel}
    </Button>
  );
}
