import { TeamMembers } from '../TeamMembers';
import { BackButton } from '../BackButton';
import { useRouter } from '../Router';

interface TeamPageProps {
  onMemberClick?: (member: any) => void;
}

export function TeamPage({ onMemberClick }: TeamPageProps) {
  const { navigateTo } = useRouter();

  const handleMemberClick = (member: any) => {
    navigateTo('member-profile', member);
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onClick={() => navigateTo('home')} />
      </div>
      
      {/* Use existing TeamMembers component */}
      <TeamMembers onMemberClick={handleMemberClick} />
    </div>
  );
}