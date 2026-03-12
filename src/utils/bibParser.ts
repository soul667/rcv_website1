export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: 'Journal' | 'Conference' | 'InProceedings';
  abstract?: string;
  doi?: string;
  url?: string;
  keywords?: string[];
}

export function parseBibFile(bibContent: string): Publication[] {
  const publications: Publication[] = [];
  
  // Split by @ to get individual entries
  const entries = bibContent.split('@').filter(entry => entry.trim().length > 0);
  
  entries.forEach(entry => {
    try {
      const publication = parseEntry(entry.trim());
      if (publication) {
        publications.push(publication);
      }
    } catch (error) {
      console.warn('Failed to parse entry:', entry.substring(0, 100));
    }
  });
  
  return publications.sort((a, b) => b.year - a.year); // Sort by year descending
}

function parseEntry(entry: string): Publication | null {
  // Extract entry type and key
  const typeMatch = entry.match(/^(\w+)\s*\{\s*([^,]+)/);
  if (!typeMatch) return null;
  
  const entryType = typeMatch[1].toLowerCase();
  const key = typeMatch[2].trim();
  
  // Skip if not article or inproceedings
  if (!['article', 'inproceedings'].includes(entryType)) {
    return null;
  }
  
  // Extract fields
  const fields: Record<string, string> = {};
  
  // Find all field = {value} patterns
  const fieldRegex = /(\w+)\s*=\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match;
  
  while ((match = fieldRegex.exec(entry)) !== null) {
    const fieldName = match[1].toLowerCase();
    let fieldValue = match[2].trim();
    
    // Clean up field value
    fieldValue = fieldValue.replace(/\s+/g, ' ').trim();
    fields[fieldName] = fieldValue;
  }
  
  // Extract required fields
  const title = fields.title?.replace(/[{}]/g, '') || '';
  const yearStr = fields.year || '';
  const year = parseInt(yearStr) || new Date().getFullYear();
  
  if (!title) return null;
  
  // Parse authors
  const authors = parseAuthors(fields.author || '');
  
  // Determine venue
  let venue = '';
  if (entryType === 'article') {
    venue = fields.journal || '';
  } else if (entryType === 'inproceedings') {
    venue = fields.booktitle || '';
  }
  
  // Determine type
  const type: 'Journal' | 'Conference' | 'InProceedings' = 
    entryType === 'article' ? 'Journal' : 'Conference';
  
  return {
    id: key,
    title: cleanText(title),
    authors,
    venue: cleanText(venue),
    year,
    type,
    abstract: fields.abstract ? cleanText(fields.abstract) : undefined,
    doi: fields.doi,
    url: fields.url,
  };
}

function parseAuthors(authorString: string): string[] {
  if (!authorString) return [];
  
  // Split by 'and' and clean up each author
  const authors = authorString
    .split(' and ')
    .map(author => {
      // Handle "Last, First" format or "First Last" format
      author = author.trim().replace(/[{}]/g, '');
      
      // If it contains a comma, it's "Last, First" format
      if (author.includes(',')) {
        const parts = author.split(',').map(p => p.trim());
        return `${parts[1]} ${parts[0]}`;
      }
      
      return author;
    })
    .filter(author => author.length > 0);
  
  return authors;
}

function cleanText(text: string): string {
  return text
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export async function loadPublications(): Promise<Publication[]> {
  try {
    const response = await fetch(getAssetUrl('data/publications.bib'));
    const bibContent = await response.text();
    return parseBibFile(bibContent);
  } catch (error) {
    console.error('Failed to load publications:', error);
    return [];
  }
}
import { getAssetUrl } from './paths';
