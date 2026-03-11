import { Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from './LanguageContext';
import { useRouter } from './Router';
import { BackButton } from './BackButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
  };
  onBack: () => void;
}

// YouTube Shortcode Component
interface YouTubeEmbedProps {
  videoId: string;
  title: string;
}

const YouTubeEmbed = ({ videoId, title }: YouTubeEmbedProps) => (
  <div className="my-8">
    <div 
      className="bg-slate-800 rounded-lg overflow-hidden shadow-lg mx-auto"
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
    <p className="text-center text-gray-400 text-sm mt-3 italic">{title}</p>
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

export function MemberProfile({ member, onBack }: MemberProfileProps) {
  const { language, t } = useLanguage();
  const { navigateTo } = useRouter();

  const handleBack = () => {
    navigateTo('team');
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <BackButton onClick={handleBack} label={t('team.backToTeam')} />

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="lg:w-1/3">
            <ImageWithFallback
              src={member.image}
              alt={member.name}
              className="w-full max-w-sm mx-auto rounded-lg object-cover aspect-square"
            />
          </div>
          
          <div className="lg:w-2/3 text-white">
            <h1 className="text-3xl lg:text-4xl mb-2">
              {language === 'zh' ? member.name : member.nameEn}
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              {language === 'zh' ? member.title : member.titleEn}
            </p>
            
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mb-6">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </a>
              )}
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
                <span>Personal Website</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Full Markdown Content */}
          <Card className="bg-slate-800/60 backdrop-blur-lg border-slate-600/60 shadow-xl">
            <CardContent className="p-8">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mb-4 mt-8 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold text-orange-500 mb-4 mt-6">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-lg font-semibold text-gray-200 mb-3 mt-4">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-base font-semibold text-gray-200 mb-2 mt-4">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-sm font-semibold text-gray-300 mb-2 mt-4">{children}</h6>,
                    p: ({ children }) => <p className="mb-4 text-gray-300 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-6 text-gray-300 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-6 text-gray-300 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        className="text-orange-500 hover:text-orange-400 transition-colors underline decoration-orange-500/30 hover:decoration-orange-400" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    img: ({ src, alt, width, height, ...props }) => {
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
                        <div className="my-6 text-center">
                          <img 
                            src={imageSrc} 
                            alt={alt || 'Research image'} 
                            className="mx-auto rounded-lg shadow-lg max-w-full h-auto"
                            style={{ 
                              maxWidth: width ? `${width}px` : '100%',
                              height: height ? `${height}px` : 'auto'
                            }}
                            {...props}
                          />
                          {alt && <p className="text-sm text-gray-400 mt-2 italic">{alt}</p>}
                        </div>
                      );
                    },
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-orange-500 pl-4 my-6 text-gray-300 italic bg-slate-700/30 py-2">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-slate-700 text-orange-400 px-2 py-1 rounded text-sm">{children}</code>
                      ) : (
                        <code className={`block bg-slate-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm ${className}`}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto mb-6">
                        {children}
                      </pre>
                    ),
                    hr: () => <hr className="border-gray-600 my-8" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-6">
                        <table className="min-w-full border border-gray-600">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-slate-700">{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
                    th: ({ children }) => <th className="px-4 py-2 text-left text-white font-semibold">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-2 text-gray-300">{children}</td>,
                    // Custom YouTube embed component
                    'youtube-embed': ({ 'data-video-id': videoId, 'data-title': title }) => {
                      return <YouTubeEmbed videoId={videoId as string} title={title as string} />;
                    },
                  } as any}
                >
                  {parseShortcodes(member.markdownContent || member.bio)}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}