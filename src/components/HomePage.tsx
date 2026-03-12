import { Hero } from './Hero';
import { useLanguage } from './LanguageContext';
import { ResearchPreview } from './previews/ResearchPreview';
import { PublicationsPreview } from './previews/PublicationsPreview';
import { TeamPreview } from './previews/TeamPreview';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useEffect, useState } from 'react';
import { getAssetUrl } from '../utils/paths';
// import { ContactPreview } from './previews/ContactPreview';

export function HomePage() {
  const { t, language } = useLanguage();
  const [mdContent, setMdContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = getAssetUrl(`docs/${language === 'zh' ? 'home_zh.md' : 'home_en.md'}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        const text = await response.text();
        if (!isCancelled) {
          setMdContent(text);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Failed to load home content.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadContent();
    return () => {
      isCancelled = true;
    };
  }, [language]);

  return (
    <>
      <Hero />
      
      {/* Lab Description Section */}
      <section
        id="intro"
        data-testid="home-intro"
        className="theme-page border-b theme-divider w-full"
        style={{ paddingTop: '50px', paddingBottom: '2rem' }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-4 pb-8 md:pt-6 md:pb-12 markdown-custom-wrapper">
          <div className="w-full">
            <div className="max-w-none">
              <div className="markdown-body">
                {loading && <p className="theme-muted">{t('loading') || 'Loading...'}</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {mdContent}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <ResearchPreview /> */}
      {/* <PublicationsPreview /> */}
      {/* <TeamPreview /> */}
      {/* <ContactPreview /> */}
    </>
  );
}
