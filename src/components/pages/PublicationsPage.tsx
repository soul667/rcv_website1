import Publications from '../Publications.tsx';
import { BackButton } from '../BackButton';
import { useRouter } from '../Router';

export function PublicationsPage() {
  const { navigateTo } = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onClick={() => navigateTo('home')} />
      </div>
      
      {/* Use existing Publications component */}
      <Publications />
    </div>
  );
}
