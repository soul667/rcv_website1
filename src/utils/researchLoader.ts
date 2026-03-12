import { parse as parseTOML } from 'smol-toml';
import { getContentUrl } from './paths';

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

// Load all research areas
export async function loadResearchAreas(): Promise<ResearchArea[]> {  
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

        const imageName = data.meta?.image
          ? String(data.meta.image).replace(/^\/+/, '')
          : '';

        const meta = {
          ...data.meta,
          image: imageName
            ? getContentUrl(`research/${encodeURIComponent(folder)}/${imageName}`)
            : ''
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
  return researchAreas.sort((a, b) => (a.meta?.weight || 0) - (b.meta?.weight || 0));
}

export type { ResearchArea };
