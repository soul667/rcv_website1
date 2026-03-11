import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useRouter } from './Router';
import { Button } from './ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { navigateTo, currentPage } = useRouter();

  const navItems = [
    { label: t('nav.home'), page: 'home' as const },
    { label: t('nav.research'), page: 'research' as const },
    { label: t('nav.publications'), page: 'publications' as const },
    { label: t('nav.team'), page: 'team' as const },
    { label: t('nav.contact'), page: 'contact' as const },
  ];

  const handleNavClick = (page: typeof navItems[0]['page']) => {
    navigateTo(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => navigateTo('home')}
            className="hidden md:flex items-center space-x-3 text-left group"
          >
            <div className="relative">
              <img 
                src="/assets/media/logo.png" 
                alt="EE Logo" 
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 filter brightness-110"
                onError={(e) => {
                  // Fallback to logo.png if ee-logo.png fails to load
                  e.currentTarget.src = "/assets/media/logo.png";
                }}
              />
            </div>
            <div className="relative">
              <img 
                src="/assets/media/ee-logo.png" 
                alt="EE Logo" 
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 filter brightness-110"
                onError={(e) => {
                  // Fallback to logo.png if ee-logo.png fails to load
                  e.currentTarget.src = "/assets/media/logo.png";
                }}
              />
            </div>
            <div className="text-white">
              {/* <div className="gradient-text font-semibold text-lg"> */}
              <div className="font-semibold text-lg"> {/* 白色 */}
                {language === 'zh' ? '机器人与计算机视觉实验室' : 'Robotics and Computer Vision Lab'}
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.page)}
                  className={`relative px-4 py-2 transition-all duration-300 ${
                    currentPage === item.page 
                      ? 'text-white rounded-full shadow-lg' 
                      : 'text-gray-200 bg-transparent rounded-full hover:text-white'
                  }`}
                  style={currentPage === item.page ? { backgroundColor: 'rgb(255 255 255 / 13%)' } : undefined}
                >
                  {item.label}
                </button>
              ))}
              
              <div className="ml-4 pl-4 border-l border-white/20">
                {/* Language Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="px-3 py-2 text-white hover:bg-[#5a5c60] hover:text-white transition-all duration-300 rounded-full"
                  style={{ backgroundColor: 'rgb(255 255 255 / 13%)' }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {language === 'en' ? '中文' : 'EN'}
                </Button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 backdrop-blur-xl bg-black/40 rounded-b-2xl">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.page)}
                  className={`relative px-4 py-3 text-left transition-all duration-300 ${
                    currentPage === item.page 
                      ? 'text-white rounded-full shadow-lg' 
                      : 'text-gray-200 bg-transparent rounded-full hover:text-white'
                  }`}
                  style={currentPage === item.page ? { backgroundColor: 'rgb(255 255 255 / 13%)' } : undefined}
                >
                  {item.label}
                </button>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                {/* Mobile Language Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleLanguage();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-white hover:bg-[#5a5c60] hover:text-white w-full justify-start rounded-full"
                  style={{ backgroundColor: 'rgb(255 255 255 / 13%)' }}
                >
                  <Globe className="h-4 w-4" />
                  <span>{language === 'en' ? '中文' : 'EN'}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
