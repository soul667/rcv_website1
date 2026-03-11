import matter from 'gray-matter';

interface AuthorData {
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
  publications: {
    title: string;
    authors: string;
    venue: string;
    year: number;
    link?: string;
  }[];
  weight?: number;
  role?: string;
  userGroups: string[];
  social?: {
    icon: string;
    icon_pack: string;
    link: string;
  }[];
  markdownContent?: string; // 添加完整的markdown内容
}

function extractSocialLinks(content: string): { icon: string; icon_pack: string; link: string }[] {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return [];

  const lines = frontmatterMatch[1].split('\n');
  const socialIndex = lines.findIndex((line) => line.trim() === 'social:');
  if (socialIndex < 0) return [];

  const socialItems: { icon: string; icon_pack: string; link: string }[] = [];
  let currentItem: Partial<{ icon: string; icon_pack: string; link: string }> | null = null;

  const assignKeyValue = (yamlLine: string, target: Partial<{ icon: string; icon_pack: string; link: string }>) => {
    const keyValue = yamlLine.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.+)\s*$/);
    if (!keyValue) return;
    const key = keyValue[1] as 'icon' | 'icon_pack' | 'link';
    const value = keyValue[2].replace(/^["']|["']$/g, '');
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
          link: currentItem.link
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
      link: currentItem.link
    });
  }

  return socialItems;
}

// Parse frontmatter from markdown content using gray-matter
function parseFrontmatter(content: string) {
  try {
    // Remove any BOM or unusual characters at the beginning
    const cleanContent = content.replace(/^\uFEFF/, '').trim();
    const parsed = matter(cleanContent);
    
    return {
      frontmatter: parsed.data,
      body: parsed.content
    };
  } catch (error) {
    console.warn('Failed to parse frontmatter with gray-matter:', error);
    console.log('Content preview:', content.substring(0, 200));
    
    // Fallback to manual parsing
    return parseManualFrontmatter(content);
  }
}

// Manual frontmatter parsing as fallback
function parseManualFrontmatter(content: string) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return { frontmatter: {}, body: content };
  
  const frontmatterText = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length).trim();
  
  const frontmatter: any = {};
  const lines = frontmatterText.split('\n');
  
  let currentKey = '';
  let currentArray: any[] = [];
  let inArray = false;
  let currentObject: any = {};
  let inSocialArray = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    if (trimmedLine.startsWith('- ')) {
      const value = trimmedLine.slice(2).trim();
      
      if (inSocialArray) {
        // Handle social array items
        if (value.includes(':')) {
          const [key, val] = value.split(':').map(s => s.trim());
          currentObject[key] = val.replace(/^["']|["']$/g, '');
        }
      } else {
        // Simple array item
        currentArray.push(value.replace(/^["']|["']$/g, ''));
        inArray = true;
      }
    } else if (trimmedLine.includes(':')) {
      // Save previous array
      if (inArray && currentKey) {
        frontmatter[currentKey] = currentArray;
        currentArray = [];
        inArray = false;
      }
      
      // Save previous social object
      if (inSocialArray && Object.keys(currentObject).length > 0) {
        if (!frontmatter.social) frontmatter.social = [];
        frontmatter.social.push(currentObject);
        currentObject = {};
      }
      
      const [key, value] = trimmedLine.split(':').map(s => s.trim());
      currentKey = key;
      
      if (value) {
        // Direct value
        frontmatter[key] = value.replace(/^["']|["']$/g, '');
        if (key === 'weight') {
          frontmatter[key] = parseInt(value) || undefined;
        }
      } else {
        // Prepare for array
        if (key === 'social') {
          inSocialArray = true;
          frontmatter.social = [];
        } else {
          inArray = true;
          currentArray = [];
        }
      }
    } else if (inSocialArray && trimmedLine.startsWith('  ')) {
      // Social object properties
      if (trimmedLine.includes(':')) {
        const [key, value] = trimmedLine.slice(2).split(':').map(s => s.trim());
        currentObject[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }
  
  // Clean up remaining data
  if (inArray && currentKey) {
    frontmatter[currentKey] = currentArray;
  }
  if (inSocialArray && Object.keys(currentObject).length > 0) {
    if (!frontmatter.social) frontmatter.social = [];
    frontmatter.social.push(currentObject);
  }
  
  return { frontmatter, body };
}

// Parse markdown body content
function parseMarkdownBody(body: string) {
  const sections: any = {};
  
  // Split by sections (### headers)
  const sectionRegex = /^### (.+)$/gm;
  const parts = body.split(sectionRegex);
  
  let currentSection = '';
  for (let i = 1; i < parts.length; i += 2) {
    const sectionTitle = parts[i].trim();
    const sectionContent = parts[i + 1]?.trim() || '';
    
    // Clean up section title - remove emojis and normalize
    const cleanTitle = sectionTitle
      .replace(/[^\w\s]/g, '') // Remove emojis and special chars
      .toLowerCase()
      .replace(/\s+/g, '_');
    
    sections[cleanTitle] = sectionContent;
  }
  
  return sections;
}

// Extract publications from markdown text
function extractPublications(text: string) {
  const publications: any[] = [];
  
  // Look for bullet points with publication info
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
      const content = line.replace(/^[-*]\s*/, '').trim();
      
      // Try to extract publication info
      const titleMatch = content.match(/^(.+?)\s*\[\[Paper\]\]/);
      const title = titleMatch ? titleMatch[1].trim() : content.split('.')[0]?.trim();
      
      if (title) {
        // Extract authors (usually after the title)
        const authorMatch = content.match(/\.\s*([^.]+?)\.\s*(.*?)\s*(\d{4})/);
        const authors = authorMatch ? authorMatch[1].trim() : '';
        const venue = authorMatch ? authorMatch[2].trim() : '';
        const yearMatch = content.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
        
        // Extract link if available
        const linkMatch = content.match(/\[\[Paper\]\]\(([^)]+)\)/);
        const link = linkMatch ? linkMatch[1] : undefined;
        
        publications.push({
          title: title.replace(/\s*\[\[.*?\]\].*$/, ''),
          authors,
          venue,
          year,
          link
        });
      }
    }
  }
  
  return publications;
}

// Load author data from markdown file
export async function loadAuthorData(authorId: string): Promise<AuthorData | null> {
  try {
    const response = await fetch(`/content/authors/${authorId}/_index.md`);
    if (!response.ok) return null;
    
    const content = await response.text();
    const { frontmatter, body } = parseFrontmatter(content);
    const sections = parseMarkdownBody(body);
    
    // Get avatar image - try multiple paths and extensions
    let image = '/assets/media/authors_research/default_avatar.png'; // fallback
    
    // List of possible image names and extensions
    const imageNames = ['avatar', 'avatar_formal', authorId.toLowerCase()];
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif']; // PNG first since most avatars are PNG
    
    // Correct paths for Vite/public folder structure
    const imagePaths = [
      `/content/authors/${authorId}`,  // This maps to /public/content/authors/{authorId}/
      `/assets/media/authors_research` // This maps to /assets/media/authors_research/
    ];
    
    let imageFound = false;
    
    // Try different combinations of paths, names, and extensions
    for (const path of imagePaths) {
      if (imageFound) break;
      
      for (const name of imageNames) {
        if (imageFound) break;
        
        for (const ext of imageExtensions) {
          const testPath = `${path}/${name}.${ext}`;
          
          try {
            // Create a new Image object to test if the image loads
            const testImage = new Image();
            
            // Use a promise to check if the image loads
            const imageExists = await new Promise<boolean>((resolve) => {
              testImage.onload = () => resolve(true);
              testImage.onerror = () => resolve(false);
              
              // Set a timeout to avoid hanging
              setTimeout(() => resolve(false), 3000);
              
              testImage.src = testPath;
            });
            
            if (imageExists) {
              image = testPath;
              imageFound = true;
              break;
            }
          } catch (error) {
            continue;
          }
        }
      }
    }
    
    // If no image found, use default
    if (!imageFound) {
      console.warn(`No image found for ${authorId}, using default`);
    }
    
    const frontmatterSocial = Array.isArray(frontmatter.social) ? frontmatter.social : [];
    const parsedSocial = frontmatterSocial.length > 0
      ? frontmatterSocial
      : extractSocialLinks(content);

    // Extract email from social links
    const email = parsedSocial?.find((s: any) => s.icon === 'envelope')?.link?.replace('mailto:', '');
    
    // Parse research interests and publications
    const researchText = sections.research || '';
    const publicationsText = sections.publications || '';
    const aboutText = sections.about_me || sections.about || '';
    
    // Extract research interests (numbered lists or bullet points)
    const research: string[] = [];
    const researchLines = researchText.split('\n');
    for (const line of researchLines) {
      if (/^\d+\./.test(line.trim()) || line.trim().startsWith('-')) {
        const interest = line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
        if (interest && !interest.includes('![')) {
          research.push(interest);
        }
      }
    }
    
    const publications = extractPublications(publicationsText);
    
    return {
      id: authorId,
      name: frontmatter.title || authorId.replace(/_/g, ' '),
      nameEn: frontmatter.title || authorId.replace(/_/g, ' '),
      title: frontmatter.role || '',
      titleEn: frontmatter.role || '',
      email,
      image,
      bio: aboutText,
      bioEn: aboutText,
      research,
      researchEn: research,
      publications,
      weight: frontmatter.weight,
      role: frontmatter.role,
      userGroups: frontmatter.user_groups || frontmatter.userGroups || [],
      social: parsedSocial,
      markdownContent: body // 添加完整的markdown内容
    };
  } catch (error) {
    console.error(`Error loading author data for ${authorId}:`, error);
    return null;
  }
}

// Load all authors
export async function loadAllAuthors(): Promise<AuthorData[]> {
  // Get list of author directories
  const authorDirs = [
    'Aoxiang_Gu', 'Bingxi_Liu', 'Bolin_Zou', 'Changfei_Fu', 'Chengjie_Zhang', 
    'Dehao_Huang', 'Guangcheng_Chen', 'Hanjing_Ye', 'Hejun_Wei', 'Hong_Zhang',
    'Huaqi_Tao', 'Jiamin_Zheng', 'Jiarui_Xu', 'Jingwen_Yu', 'Li-He',
    'Lihuang_Fang', 'Luyao_Liu', 'Mingzhe_Lv', 'Qianer_Li', 'Senzi_Luo',
    'Tianle_Zeng', 'Tingcui_Yan', 'Weinan_Chen', 'Weixi_Situ', 'Wenlong_Dong',
    'Yanci_wen', 'Yicheng_He', 'Yu_Zhan', 'Yufan_Mao', 'Zanjia_Tong'
  ];
  
  const authors: AuthorData[] = [];
  
  for (const authorId of authorDirs) {
    const authorData = await loadAuthorData(authorId);
    if (authorData) {
      authors.push(authorData);
    }
  }
  
  // Sort by weight (lower weight = higher priority)
  return authors.sort((a, b) => (a.weight || 999) - (b.weight || 999));
}

// Categorize authors by role
export function categorizeAuthors(authors: AuthorData[]) {
  const faculty = authors.filter(author => 
    author.userGroups.includes('Faculty Members') || 
    author.role?.toLowerCase().includes('professor') ||
    author.role?.toLowerCase().includes('head')
  );
  
  const phdStudents = authors.filter(author => 
    author.userGroups.includes('Ph.D. Students') ||
    author.userGroups.includes('PhD Students') ||
    author.role?.toLowerCase().includes('ph.d') ||
    author.role?.toLowerCase().includes('phd')
  );
  
  const masterStudents = authors.filter(author => 
    author.userGroups.includes('M.Sc. Students') ||
    author.userGroups.includes('Master Students') ||
    author.role?.toLowerCase().includes('m.sc.') ||
    author.role?.toLowerCase().includes('master')
  );
  
  const researchAssociates = authors.filter(author => 
    author.userGroups.includes('Research Associates') ||
    author.role?.toLowerCase().includes('research associate')
  );
  
  const administrativeAssistants = authors.filter(author => 
    author.userGroups.includes('Administrative Assistants') ||
    author.role?.toLowerCase().includes('administrative assistant')
  );
  
  const others = authors.filter(author => 
    !faculty.includes(author) && 
    !phdStudents.includes(author) && 
    !masterStudents.includes(author) &&
    !researchAssociates.includes(author) &&
    !administrativeAssistants.includes(author)
  );
  
  return { faculty, phdStudents, masterStudents, researchAssociates, administrativeAssistants, others };
}
