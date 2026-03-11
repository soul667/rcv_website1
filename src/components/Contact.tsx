import { MapPin, Mail, ArrowUpRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useRouter } from './Router';
import { BackButton } from './BackButton';

interface ContactProps {
  isStandalonePage?: boolean;
}

const emailAddress = 'yantc@mail.sustech.edu.cn';

export function Contact({ isStandalonePage = false }: ContactProps) {
  const { language, t } = useLanguage();
  const { navigateTo, currentPage } = useRouter();

  const isContactPage = currentPage === 'contact';

  const contactItems = [
    {
      id: 'address',
      icon: MapPin,
      label: language === 'zh' ? '地址' : 'Address',
      value:
        language === 'zh'
          ? '电子与电气工程系\n南方科技大学\n深圳, 中国'
          : 'Dept. of Electronic & Electrical Engineering\nSouthern University of Science and Technology\nShenzhen, China',
      href: 'https://maps.google.com/?q=Southern+University+of+Science+and+Technology',
      linkText: language === 'zh' ? '在地图中查看' : 'View on Maps',
    },
    {
      id: 'email',
      icon: Mail,
      label: language === 'zh' ? '邮箱' : 'Email',
      value: emailAddress,
      href: `mailto:${emailAddress}`,
      linkText: language === 'zh' ? '发送邮件' : 'Send Message',
    },
  ];

  return (
    <section id="contact" className={`relative w-full bg-slate-900 selection:bg-white/20 ${isContactPage ? 'pt-20 pb-20' : 'py-20'} flex flex-col items-center overflow-hidden`}>
      {isContactPage && (
        <div className="w-full max-w-3xl px-6 mb-4">
          <BackButton onClick={() => navigateTo('home')} className="md:hidden" />
        </div>
      )}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[680px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl px-6">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-white/50 mb-4">
            RCV Contact
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white mb-4">{t('contact.title')}</h2>
          <p className="mx-auto max-w-sm text-[14px] font-light text-white/40 leading-relaxed">
            {language === 'zh'
              ? '欢迎与我们联系，关于学术合作、研究交流或招生问题都可以发邮件咨询。'
              : 'We welcome inquiries about academic collaboration, research exchange, or admissions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {contactItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center p-7 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500"
              >
                <Icon className="h-5 w-5 text-white/20 mb-5 transition-colors duration-500 group-hover:text-white/60" />

                <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30 mb-4">
                  {item.label}
                </h3>

                <p className="whitespace-pre-line text-[14px] font-light text-white/70 leading-relaxed mb-6">
                  {item.value}
                </p>

                <div className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-white/30 transition-colors duration-500 group-hover:text-white/80">
                  {item.linkText}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/45">
            {language === 'zh' ? '地图' : 'Map'}
          </div>
          <iframe
            title="SUSTech Map"
            src="https://www.google.com/maps?q=Southern+University+of+Science+and+Technology+Shenzhen&output=embed"
            className="w-full h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-12 text-center">
          <span className="text-[10px] font-medium tracking-[0.2em] text-white/25 uppercase">
            © {new Date().getFullYear()} SUSTech RCV Lab
          </span>
        </div>
      </div>
    </section>
  );
}
