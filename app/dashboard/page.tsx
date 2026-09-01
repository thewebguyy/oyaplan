import { SavedPlanService } from '@/lib/services/identity/savedPlanService';
import { GroupService } from '@/lib/services/identity/groupService';
import DashboardTabs from './DashboardTabs';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [savedPlansRes, squadsRes] = await Promise.all([
    SavedPlanService.getSavedPlans(),
    GroupService.getUserGroups(),
  ]);

  const savedPlans = (savedPlansRes.success && savedPlansRes.data) ? savedPlansRes.data : [];
  const squads = (squadsRes.success && squadsRes.data) ? squadsRes.data : [];

  return (
    <DashboardTabs
      savedPlans={savedPlans as any}
      squads={squads}
    />
  );
}
