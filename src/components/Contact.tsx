import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Phone, Mail, Globe, ArrowLeft, Clock, Send } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useRouter } from './Router';

interface ContactProps {
  isStandalonePage?: boolean;
}

export function Contact({ isStandalonePage = false }: ContactProps) {
  const { language, t } = useLanguage();
  const { navigateTo, currentPage } = useRouter();

  const isContactPage = currentPage === 'contact';

  return (
    <section id="contact" className={`min-h-screen bg-gray-900 ${isContactPage ? 'pt-24 pb-20' : 'py-20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isContactPage && (
          <Button
            onClick={() => navigateTo('home')}
            variant="ghost"
            className="mb-8 text-gray-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'zh' ? '返回主页' : 'Back to Home'}
          </Button>
        )}

        {/* Page Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Send className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">
              {language === 'zh' ? '与我们联系' : 'Get in Touch'}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('contact.title')}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {language === 'zh'
              ? '欢迎与我们联系，无论是学术合作、研究交流还是招生咨询，我们都期待您的来信。'
              : 'We welcome inquiries about academic collaboration, research exchange, or admissions. Feel free to reach out to us.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information Cards */}
          <div className="space-y-5">
            {/* Address */}
            <Card className="border border-gray-700/50 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 hover:border-gray-600/70 transition-all duration-300 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500/10 rounded-lg p-3 shrink-0">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-gray-100">{t('contact.address')}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {language === 'zh' ? (
                        <>
                          中国深圳市南山区<br />
                          南方科技大学<br />
                          电子与电气工程系
                        </>
                      ) : (
                        <>
                          Department of Electronic and Electrical Engineering<br />
                          Southern University of Science and Technology<br />
                          Nanshan District, Shenzhen, China
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border border-gray-700/50 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 hover:border-gray-600/70 transition-all duration-300 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500/10 rounded-lg p-3 shrink-0">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-gray-100">{t('contact.phone')}</h3>
                    <p className="text-gray-400 text-sm">+86 755 8801 0000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border border-gray-700/50 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 hover:border-gray-600/70 transition-all duration-300 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-500/10 rounded-lg p-3 shrink-0">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-gray-100">{t('contact.email')}</h3>
                    <p className="text-gray-400 text-sm">rcvlab@sustech.edu.cn</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Website */}
            <Card className="border border-gray-700/50 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 hover:border-gray-600/70 transition-all duration-300 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500/10 rounded-lg p-3 shrink-0">
                    <Globe className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-gray-100">{t('contact.website')}</h3>
                    <p className="text-gray-400 text-sm">www.rcvlab.sustech.edu.cn</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="border border-gray-700/50 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 hover:border-gray-600/70 transition-all duration-300 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-500/10 rounded-lg p-3 shrink-0">
                    <Clock className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-gray-100">
                      {language === 'zh' ? '办公时间' : 'Office Hours'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {language === 'zh' ? '周一至周五：9:00 AM – 6:00 PM' : 'Monday – Friday: 9:00 AM – 6:00 PM'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map / Location Section */}
          <div className="rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl bg-gray-800/60 backdrop-blur-sm">
            {/* Styled map placeholder */}
            <div
              className="relative h-80 lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
            >
              {/* Dot-grid background pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              {/* Subtle radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)]" />

              <div className="relative z-10 text-center px-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-full p-5 mb-5 mx-auto w-fit">
                  <MapPin className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-white font-semibold text-lg mb-1">
                  {language === 'zh' ? '南方科技大学' : 'Southern University of Science and Technology'}
                </p>
                <p className="text-gray-400 text-sm mb-5">
                  {language === 'zh'
                    ? '广东省深圳市南山区学苑大道1088号'
                    : '1088 Xueyuan Ave, Nanshan District, Shenzhen, China'}
                </p>
                <a
                  href="https://maps.google.com/?q=Southern+University+of+Science+and+Technology+Shenzhen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg px-5 py-2.5 text-blue-400 text-sm font-medium transition-all duration-200 hover:border-blue-400/50"
                >
                  <MapPin className="h-4 w-4" />
                  {language === 'zh' ? '在地图中打开' : 'Open in Google Maps'}
                </a>
              </div>
            </div>

            {/* Bottom info strip */}
            <div className="p-5 border-t border-gray-700/50 flex items-center gap-3">
              <div className="bg-blue-500/10 rounded-lg p-2 shrink-0">
                <MapPin className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-100 text-sm font-medium">
                  {language === 'zh' ? '电子与电气工程系' : 'Dept. of Electronic & Electrical Engineering'}
                </p>
                <p className="text-gray-500 text-xs">
                  {language === 'zh' ? '南方科技大学, 深圳, 中国' : 'SUSTech, Shenzhen, China'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}