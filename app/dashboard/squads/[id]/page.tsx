import { redirect } from 'next/navigation';
import { GroupService } from '@/lib/services/identity/groupService';
import SquadDetailClient from './SquadDetailClient';

export const dynamic = 'force-dynamic';

interface SquadPageProps {
  params: Promise<{ id: string }>;
}

export default async function SquadDetailPage({ params }: SquadPageProps) {
  const { id } = await params;
  if (!id) {
    redirect('/dashboard');
  }

  const { success, data, error } = await GroupService.getGroupDetails(id);

  if (!success || !data) {
    if (error === 'unauthorized') {
      redirect('/?error=unauthorized');
    }
    redirect('/dashboard');
  }

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] pt-24 pb-16 px-4">
      <SquadDetailClient
        group={data.group}
        initialMembers={data.members}
        plans={data.plans}
      />
    </main>
  );
}
