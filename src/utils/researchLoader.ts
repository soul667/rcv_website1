import { parse as parseTOML } from 'smol-toml';
import { getContentUrl, getPublicUrl } from './paths';

interface ResearchArea {
  meta: {
    title: string;
    title_zh: string;
    weight: number;
    image: string;
    color: string;
  };
  description: {
    en: string;
    zh: string;
  };
  keywords: {
    en: string;
    zh: string;
  }[];
  members: {
    name: string;
    slug: string;
    topic: string;
    topic_zh: string;
  }[];
  folderPath: string; // Keep for internal tracking if needed
}

let researchCache: ResearchArea[] | null = null;
let researchPromise: Promise<ResearchArea[]> | null = null;

// Load all research areas
export async function loadResearchAreas(): Promise<ResearchArea[]> {  
  if (researchCache) return researchCache;
  if (researchPromise) return researchPromise;

  researchPromise = (async () => {
    try {
      const researchFolders = [
        'simultaneous localization and mapping',
        'semantic scene understanding', 
        'human-robot interaction',
        'perception with the polarization camera'
      ];

      // Load all research areas in parallel instead of sequentially
      const results = await Promise.all(
        researchFolders.map(async (folder) => {
          try {
            const response = await fetch(getContentUrl(`research/${encodeURIComponent(folder)}/index.toml`));
            if (!response.ok) {
              console.warn(`Failed to load research area TOML: ${folder}`);
              return null;
            }
            
            const content = await response.text();
            const data = parseTOML(content) as any;

            const rawImage = data.meta?.image ? String(data.meta.image) : '';

            // The image field may be a full path like "/content/research/xxx/featured.gif"
            // or just a filename like "featured.png". Handle both cases.
            let imageUrl = '';
            if (rawImage) {
              if (rawImage.startsWith('/content/') || rawImage.startsWith('content/')) {
                // Already a full content path — just resolve relative to public root
                imageUrl = getPublicUrl(rawImage);
              } else {
                // Just a filename — build the full path from folder + filename
                const fileName = rawImage.replace(/^\/+/, '');
                imageUrl = getContentUrl(`research/${encodeURIComponent(folder)}/${fileName}`);
              }
            }

            const meta = {
              ...data.meta,
              image: imageUrl
            };
            
            return {
              ...data,
              meta,
              folderPath: folder
            } as ResearchArea;
          } catch (error) {
            console.error(`Error loading research area TOML ${folder}:`, error);
            return null;
          }
        })
      );

      const researchAreas = results.filter((a): a is ResearchArea => a !== null);

      // Sort by weight defined in meta
      const sorted = researchAreas.sort((a, b) => (a.meta?.weight || 0) - (b.meta?.weight || 0));
      researchCache = sorted;
      return sorted;
    } finally {
      researchPromise = null;
    }
  })();
  
  return researchPromise;
}

export type { ResearchArea };
