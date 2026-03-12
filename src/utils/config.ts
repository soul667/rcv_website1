import { getAssetUrl } from './paths';

export interface HeroSlide {
  image: string;
  alt: string;
}

export interface HeroConfig {
  slides: HeroSlide[];
  autoPlay: boolean;
  slideDuration: number;
  showNavigation: boolean;
  showIndicators: boolean;
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  description: string;
}

// Default configuration - can be replaced with actual file reading
export const defaultHeroConfig: HeroConfig = {
  slides: [
    { image: getAssetUrl('media/home_slides/home_8.png'), alt: "RCV Lab Main Facility" },
    { image: getAssetUrl('media/home_slides/home_9.jpg'), alt: "Research Laboratory Environment" },
    { image: getAssetUrl('media/home_slides/home_14.jpg'), alt: "Advanced Equipment and Technology" },
    { image: getAssetUrl('media/home_slides/home_15.png'), alt: "University Campus Building" },
    // { image: getAssetUrl('media/home_slides/home_5.jpg'), alt: "Engineering Research Facility" },
    // { image: getAssetUrl('media/home_slides/home_6.jpg'), alt: "Modern Laboratory Setup" },
  ],
  autoPlay: true,
  slideDuration: 5000,
  showNavigation: true,
  showIndicators: true,
};

// Default team carousel configuration
export const defaultTeamCarouselConfig: HeroConfig = {
  slides: [
    { image: getAssetUrl('media/home_slides/home_1.jpg'), alt: "Lab Team Meeting" },
    { image: getAssetUrl('media/home_slides/home_2.jpg'), alt: "Research Discussion" },
    { image: getAssetUrl('media/home_slides/home_3.jpg'), alt: "Lab Workspace" },
    { image: getAssetUrl('media/home_slides/home_4.jpg'), alt: "Team Collaboration" },
    { image: getAssetUrl('media/home_slides/home_5.jpg'), alt: "Lab Environment" },
  ],
  autoPlay: true,
  slideDuration: 4000,
  showNavigation: true,
  showIndicators: true,
};

export const defaultSiteConfig: SiteConfig = {
  title: "Robotics and Computer Vision Lab",
  subtitle: "RCV Lab",
  description: "The Robotics and Computer Vision Lab (RCV Lab) is committed to cutting-edge research in the field of robotics.",
};

// Function to get hero configuration
export function getHeroConfig(): HeroConfig {
  // In the future, this can read from the actual TOML file
  // For now, return the default configuration
  return defaultHeroConfig;
}

// Function to get team carousel configuration
export function getTeamCarouselConfig(): HeroConfig {
  // In the future, this can read from the actual TOML file
  // For now, return the default configuration
  return defaultTeamCarouselConfig;
}

// Function to get site configuration
export function getSiteConfig(): SiteConfig {
  // In the future, this can read from the actual TOML file
  // For now, return the default configuration
  return defaultSiteConfig;
}
