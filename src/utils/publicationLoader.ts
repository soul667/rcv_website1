import { parse } from 'yaml';
import { Publication } from './bibParser'; // Re-use the existing interface or define a new one
import { getAssetUrl, getContentUrl } from './paths';

export interface YamlPublication {
  id: string; // Used internally as key (folder name)
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: 'Journal' | 'Conference' | 'Preprint';
  abstract?: string;
  doi?: string;
  url?: string;
  keywords?: string[];
  highlighted?: boolean;
}

const FALLBACK_PUBLICATIONS = [
  "an-2022-deep", "an-2023-open", "chen-2020-ceb", "chen-2021-dynamic",
  "chen-2021-robustness", "chen-2022-perspective", "chen-2023-cloud",
  "chen-2023-rumination", "chen-2024-cloud", "chen-2024-polarimetric",
  "chen-keyframe-2022", "elkerdawy-2022-fire", "fu-2020-fastorb",
  "ge-2024-commonsense", "he-2023-igicp", "he-2023-large",
  "huang-2023-efficient", "ji-2024-point", "jiao-2022-fusionportable",
  "lin-2021-robust", "lin-2023-robust", "lin-2024-swcf",
  "liu-2024-edge", "liu-2024-npr", "loo-2021-deeprelativefusion",
  "lv-2021-semantically", "shakeri-2021-polarimetric", "shao-2020-learning",
  "tang-2022-relationship", "tang-2023-graspgpt", "tang-2023-multi",
  "tang-2023-task", "ting-2021-deep", "wang-2020-real",
  "wen-2021-dense", "wen-2021-semantic", "wen-2023-hybrid",
  "yang-2021-resilient", "yang-2021-uvip", "yang-2022-robust",
  "yang-2023-vi", "ye-2021-mapping", "ye-2023-condition",
  "ye-2023-robot", "yin-2024-tightly", "yu-2024-benchmarking",
  "yuan-2024-wireless", "zeng-2024-visual", "zhao-2024-human",
  "zhou-2022-ndd"
];

async function getPublicationFolders(): Promise<string[]> {
  try {
    const res = await fetch(getAssetUrl('data/publications.json'));
    if (!res.ok) {
      throw new Error(`Failed to load publications.json (${res.status})`);
    }
    const payload = await res.json();
    const list = Array.isArray(payload?.publications) ? payload.publications : Array.isArray(payload) ? payload : [];
    if (list.length) {
      return list.map((id: any) => String(id)).filter(Boolean);
    }
  } catch (err) {
    console.warn('Falling back to bundled publication list:', err);
  }
  return FALLBACK_PUBLICATIONS;
}

export async function loadAllYamlPublications(): Promise<YamlPublication[]> {
  try {
    const publicationFolders = await getPublicationFolders();
    const pubPromises = publicationFolders.map(async (folder) => {
      try {
        // Fetch YAML file
        const res = await fetch(getContentUrl(`publication/${folder}/index.yaml`));
        if (!res.ok) return null;
        
        const yamlText = await res.text();
        const data = parse(yamlText);
        
        if (!data) return null;

        // Determine publication type robustly based on existing numbers/strings
        // Mapping from older publication_types -> 1: Conference, 2: Journal, 3: Preprint/Other
        let pubType: 'Journal' | 'Conference' | 'Preprint' = 'Conference';
        if (data.publication_types && data.publication_types.includes('2')) {
          pubType = 'Journal';
        } else if (data.publication_types && data.publication_types.includes('3')) {
          pubType = 'Preprint';
        }

        // Map yaml frontmatter structure to our interface
        const pub: YamlPublication = {
          id: folder,
          title: data.title || '',
          authors: data.authors || [],
          venue: data.publication?.replace(/[*]/g, '') || '', // Remove markdown italics *
          year: data.date ? new Date(data.date).getFullYear() : (new Date().getFullYear()),
          type: pubType,
          abstract: data.abstract || data.summary || data.description || undefined,
          doi: data.doi || undefined,
          // Support multiple typical Hugo/Academic formats
          url: data.url_pdf || data.url_project || data.url_code || data.url_dataset || data.links?.[0]?.url || undefined,
          keywords: data.tags || undefined,
          highlighted: data.featured || false,
        };

        return pub;
      } catch (err) {
        console.error(`Failed loading publication from ${folder}:`, err);
        return null; // Resolve to null so Promise.all doesn't completely fail
      }
    });

    const results = await Promise.all(pubPromises);
    const validPublications = results.filter((p): p is YamlPublication => p !== null);

    // Sort descending by year
    return validPublications.sort((a, b) => b.year - a.year);
  } catch (error) {
    console.error('Failed to load all parallel publications:', error);
    return [];
  }
}
