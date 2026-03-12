import { Mail, GraduationCap, Github, Globe, Twitter, Linkedin, FileText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from './LanguageContext';
import { useRouter } from './Router';
import { BackButton } from './BackButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useEffect, useState } from 'react';

interface MemberProfileProps {
  member: {
    id: string;
    name: string;
    nameEn: string;
    title: string;
    titleEn: string;
    email?: string;
    image: string;
    bio: string;
    bioEn: string;
    research: string[];
    researchEn: string[];
    publications: Array<{
      title: string;
      authors: string;
      venue: string;
      year: number;
      link?: string;
    }>;
    markdownContent?: string; // 添加完整的markdown内容
    social?: {
      icon: string;
      icon_pack: string;
      link: string;
    }[];
  };
  onBack: () => void;
}

// YouTube Shortcode Component
interface YouTubeEmbedProps {
  videoId: string;
  title: string;
}

type SocialLink = {
  icon: string;
  icon_pack: string;
  link: string;
};

const YouTubeEmbed = ({ videoId, title }: YouTubeEmbedProps) => (
  <div className="my-8 w-full flex justify-center">
    <div 
      className="bg-slate-800 rounded-lg overflow-hidden shadow-lg"
      style={{ 
        width: '100%', 
        maxWidth: '1280px', 
        aspectRatio: '16/9' 
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  </div>
);

// Shortcode parser function
const parseShortcodes = (content: string): string => {
  // Replace YouTube shortcodes with placeholder that ReactMarkdown can handle
  return content.replace(
    /\{\{<\s*youtube\s+([^"\s]+)\s+"([^"]+)"\s*>\}\}/g,
    (match, videoId, title) => {
      // Return a custom HTML element that we can handle in ReactMarkdown components
      return `<youtube-embed data-video-id="${videoId}" data-title="${title}"></youtube-embed>`;
    }
  );
};

const extractSocialLinksFromFrontmatter = (content: string): SocialLink[] => {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return [];

  const lines = frontmatterMatch[1].split('\n');
  const socialIndex = lines.findIndex((line) => line.trim() === 'social:');
  if (socialIndex < 0) return [];

  const socialItems: SocialLink[] = [];
  let currentItem: Partial<SocialLink> | null = null;

  const assignKeyValue = (yamlLine: string, target: Partial<SocialLink>) => {
    const keyValue = yamlLine.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.+)\s*$/);
    if (!keyValue) return;
    const key = keyValue[1] as 'icon' | 'icon_pack' | 'link';
    const value = keyValue[2].replace(/^["']|["']$/g, '').trim();
    if (key === 'icon' || key === 'icon_pack' || key === 'link') {
      target[key] = value;
    }
  };

  for (let i = socialIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;
    if (/^[A-Za-z_][\w-]*\s*:/.test(trimmed) && !line.startsWith(' ')) break;

    if (/^\s*-\s+/.test(line)) {
      if (currentItem?.link) {
        socialItems.push({
          icon: currentItem.icon || 'globe',
          icon_pack: currentItem.icon_pack || 'fas',
          link: currentItem.link,
        });
      }

      currentItem = {};
      assignKeyValue(line.replace(/^\s*-\s+/, ''), currentItem);
      continue;
    }

    if (currentItem) {
      assignKeyValue(line, currentItem);
    }
  }

  if (currentItem?.link) {
    socialItems.push({
      icon: currentItem.icon || 'globe',
      icon_pack: currentItem.icon_pack || 'fas',
      link: currentItem.link,
    });
  }

  return socialItems;
};

const normalizeSocialLinks = (social: Array<Partial<SocialLink>> = []): SocialLink[] => {
  return social
    .filter((item) => typeof item?.link === 'string' && item.link.trim())
    .map((item) => ({
      icon: item.icon?.trim() || 'globe',
      icon_pack: item.icon_pack?.trim() || 'fas',
      link: item.link!.trim(),
    }));
};

export function MemberProfile({ member, onBack }: MemberProfileProps) {
  const { language, t } = useLanguage();
  const { navigateTo } = useRouter();
  const [resolvedSocialLinks, setResolvedSocialLinks] = useState<SocialLink[]>(() => normalizeSocialLinks(member.social));

  const handleBack = () => {
    navigateTo('team');
  };

  const getSocialIcon = (iconName: string) => {
    const normalizedIcon = iconName.trim().toLowerCase();
    switch (normalizedIcon) {
      case 'envelope':
        return Mail;
      case 'graduation-cap':
        return GraduationCap;
      case 'github':
        return Github;
      case 'twitter':
        return Twitter;
      case 'linkedin':
        return Linkedin;
      case 'globe':
        return Globe;
      case 'cv':
        return FileText;
      default:
        return Globe;
    }
  };

  const getSocialLabel = (iconName: string, link: string) => {
    const normalizedIcon = iconName.trim().toLowerCase();
    if (normalizedIcon === 'envelope') {
      return link.replace(/^mailto:/, '');
    }
    if (normalizedIcon === 'graduation-cap') return 'Google Scholar';
    if (normalizedIcon === 'github') return 'GitHub';
    if (normalizedIcon === 'twitter') return 'X / Twitter';
    if (normalizedIcon === 'linkedin') return 'LinkedIn';
    if (normalizedIcon === 'cv') return 'CV';
    return 'Website';
  };

  useEffect(() => {
    setResolvedSocialLinks(normalizeSocialLinks(member.social));
  }, [member]);

  useEffect(() => {
    if (resolvedSocialLinks.length > 0) return;

    let isCancelled = false;
    const loadSocialFromMarkdown = async () => {
      try {
        const response = await fetch(`/content/authors/${member.id}/_index.md`);
        if (!response.ok) return;

        const content = await response.text();
        const extracted = extractSocialLinksFromFrontmatter(content);
        if (!isCancelled && extracted.length > 0) {
          setResolvedSocialLinks(normalizeSocialLinks(extracted));
        }
      } catch (error) {
        // Ignore fallback fetch errors to keep profile rendering stable.
      }
    };

    loadSocialFromMarkdown();
    return () => {
      isCancelled = true;
    };
  }, [member.id, resolvedSocialLinks.length]);

  const socialLinks = resolvedSocialLinks;
  const hasEmailInSocial = socialLinks.some((item) => item.icon.toLowerCase() === 'envelope');

  return (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <BackButton onClick={handleBack} label={t('team.backToTeam')} />

        {/* Header - Resume Style */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-6 mb-12 sm:items-start items-center">
          {/* Profile Details (Left) */}
          <div className="flex-1 text-center sm:text-left text-white pt-1 sm:pt-2">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-2">
              {language === 'zh' ? member.name : member.nameEn}
            </h1>
            <p className="text-lg text-gray-300 mb-6 font-normal">
              {language === 'zh' ? member.title : member.titleEn}
            </p>
            
            {/* Contact Info - Minimal Inline Style */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3">
               {member.email && !hasEmailInSocial && (
                 <a
                   href={`mailto:${member.email}`}
                   className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                 >
                   <Mail className="h-4 w-4" />
                   <span>{member.email}</span>
                 </a>
               )}
               {socialLinks.map((item, index) => {
                 const IconComponent = getSocialIcon(item.icon);
                 const isMail = item.link.startsWith('mailto:');
                 return (
                  <a
                    key={`${item.icon}-${index}`}
                    href={item.link}
                    target={isMail ? undefined : '_blank'}
                    rel={isMail ? undefined : 'noopener noreferrer'}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{getSocialLabel(item.icon, item.link)}</span>
                  </a>
                 );
               })}
             </div>
          </div>
          
          {/* Smaller Profile Image (Right) */}
          <div className="flex-shrink-0">
            <ImageWithFallback
              src={member.image}
              alt={member.name}
              className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-lg object-cover shadow-md border border-slate-700/50"
              loading="lazy"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 my-10 w-full" />

        {/* Content - aligned with header */}
        <div className="overflow-x-hidden">
          <div className="markdown-custom-wrapper w-full">
            <div className="markdown-body p-0 bg-transparent text-gray-300 max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} className="text-[#CB743B] hover:text-[#e08950] transition-colors" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    img: ({ src, alt, width, ...props }) => {
                      // Handle image path resolution
                      let imageSrc = src;
                      
                      if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
                        // Handle authors_research path mapping
                        if (src.startsWith('authors_research/')) {
                          imageSrc = `/assets/${src}`;
                        } else {
                          // If src is relative (starts with just filename), prepend the author's folder path
                          imageSrc = `/content/authors/${member.id}/${src}`;
                        }
                      }
                      
                      return (
                        <div className="my-6 flex flex-col items-center justify-center w-full" style={{ textAlign: 'center' }}>
                          <img 
                            src={imageSrc} 
                            alt={alt || 'Research image'} 
                            className="rounded-lg shadow-lg"
                            style={{ 
                              maxWidth: width ? `min(100%, ${width}px)` : '100%',
                              height: 'auto',
                              display: 'block',
                              margin: '0 auto'
                            }}
                            {...props}
                          />
                        </div>
                      );
                    },
                    
                    // Custom YouTube embed component
                    'youtube-embed': ({ 'data-video-id': videoId, 'data-title': title }) => {
                      return <YouTubeEmbed videoId={videoId as string} title={title as string} />;
                    },
                  } as any}
                >
                  {parseShortcodes(member.markdownContent || member.bio)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
