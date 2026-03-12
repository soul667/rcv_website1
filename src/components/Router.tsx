import { createContext, useContext, useState, ReactNode } from 'react';

type Page = 'home' | 'research' | 'publications' | 'team' | 'contact' | 'member-profile';

interface RouterContextType {
  currentPage: Page;
  previousPage: Page | null;
  navigateTo: (page: Page, data?: any) => void;
  pageData?: any;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);
  const [pageData, setPageData] = useState<any>(null);

  const navigateTo = (page: Page, data?: any) => {
    // Record the previous page before navigating to member-profile
    if (page === 'member-profile') {
      setPreviousPage(currentPage);
    } else {
      setPreviousPage(null);
    }
    setCurrentPage(page);
    setPageData(data || null);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ currentPage, previousPage, navigateTo, pageData }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}