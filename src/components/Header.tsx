import { Menu, Globe, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useRouter } from './Router';
import { useTheme } from './ThemeContext';
import { getAssetUrl } from '../utils/paths';

export function Header() {
  const [showDesktopTitle, setShowDesktopTitle] = useState(() => window.innerWidth >= 1100);
  const { language, toggleLanguage, t } = useLanguage();
  const { navigateTo, currentPage } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const drawerId = 'mobile-nav-drawer';
  const logo = getAssetUrl('media/logo.png');
  const eeLogo = getAssetUrl('media/ee-logo.png');

  useEffect(() => {
    const handleResize = () => {
      setShowDesktopTitle(window.innerWidth >= 1100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: t('nav.home'), page: 'home' as const },
    { label: t('nav.research'), page: 'research' as const },
    { label: t('nav.publications'), page: 'publications' as const },
    { label: t('nav.team'), page: 'team' as const },
  ];

  const closeDrawer = () => {
    const el = document.getElementById(drawerId) as HTMLInputElement | null;
    if (el) el.checked = false;
  };

  const handleNavClick = (page: typeof navItems[0]['page']) => {
    navigateTo(page);
    closeDrawer();
  };

  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const themeText = theme === 'dark' ? t('nav.light') : t('nav.dark');
  const themeLabel = language === 'zh'
    ? `切换到${themeText}模式`
    : `Switch to ${themeText} mode`;

  return (
    <>
      {/* DaisyUI Drawer wrapper — only active on mobile */}
      <div className="drawer md:hidden drawer-end">
        <input id={drawerId} type="checkbox" className="drawer-toggle" />

        {/* Header bar */}
        <div className="drawer-content">
          <header className="theme-header fixed top-0 w-full z-50 border-b backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo (mobile: just icon) */}
                <button onClick={() => navigateTo('home')} className="text-left group">
                  <div className="flex items-center space-x-2">
                    <img
                      src={logo}
                      alt="RCV Logo"
                      className="h-10 w-10 object-contain filter brightness-110"
                    />
                  </div>
                </button>

                {/* Mobile Hamburger */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={themeLabel}
                    className="theme-icon-button inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300"
                  >
                    <ThemeIcon className="h-4 w-4" />
                  </button>
                  <label htmlFor={drawerId} className="theme-icon-button inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300">
                    <Menu className="h-6 w-6" />
                  </label>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* Drawer Side Panel */}
        <div className="drawer-side z-[100]">
          <label htmlFor={drawerId} aria-label="close sidebar" className="drawer-overlay backdrop-blur-sm bg-black/40 dark:bg-black/60" />
          <div className="theme-surface menu min-h-full w-72 border-l p-6 flex flex-col gap-1" style={{ boxShadow: 'var(--drawer-shadow)' }}>
            {/* Close hint / branding */}
            <div className="mb-4 pb-4 border-b theme-divider">
              <p className="theme-muted text-xs tracking-widest uppercase">Navigation</p>
            </div>

            {/* Nav Items */}
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.page)}
                className={`text-left px-4 py-3 rounded-lg transition-all duration-200 text-base ${
                  currentPage === item.page
                    ? 'font-medium border-l-2 border-[#CB743B] pl-3 theme-surface-strong'
                    : 'theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay)] font-normal'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Language Toggle */}
            <div className="mt-auto pt-4 border-t theme-divider space-y-3">
              <button
                onClick={() => { toggleTheme(); closeDrawer(); }}
                className="theme-icon-button flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-sm"
              >
                <ThemeIcon className="h-4 w-4" />
                <span>{themeText}</span>
              </button>
              <button
                onClick={() => { toggleLanguage(); closeDrawer(); }}
                className="theme-icon-button flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-sm"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'en' ? '中文' : 'EN'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header (hidden on mobile) */}
      <header className="theme-header hidden md:block fixed top-0 w-full z-50 border-b backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={() => navigateTo('home')} className="text-left group">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="EE Logo" className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 filter brightness-110" />
                <img src={eeLogo} alt="EE Logo" className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 filter brightness-110" onError={(e) => { e.currentTarget.src = logo; }} />
                {showDesktopTitle && (
                  <div className="text-[color:var(--foreground)] font-semibold text-lg">
                    {language === 'zh' ? '机器人与计算机视觉实验室' : 'Robotics and Computer Vision Lab'}
                  </div>
                )}
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav>
              <div className="flex items-center space-x-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigateTo(item.page)}
                    className={`relative px-5 py-2 transition-all duration-300 text-sm font-medium rounded-full tracking-wide ${
                      currentPage === item.page
                        ? 'text-[color:var(--foreground)] bg-[var(--overlay-strong)] backdrop-blur-md border border-[color:var(--border-strong)] shadow-[0_8px_32px_rgba(15,23,42,0.08)]'
                        : 'theme-muted hover:text-[color:var(--foreground)] hover:bg-[var(--overlay)] border border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="ml-4 pl-4 border-l theme-divider flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    aria-label={themeLabel}
                    className="theme-icon-button flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full tracking-wide"
                  >
                    <ThemeIcon className="h-4 w-4 mr-2 opacity-90" />
                    <span>{themeText}</span>
                  </button>
                  <button
                    onClick={toggleLanguage}
                    className="theme-icon-button flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full tracking-wide"
                  >
                    <Globe className="h-4 w-4 mr-2 opacity-90" />
                    <span>{language === 'en' ? '中 文' : 'EN'}</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
