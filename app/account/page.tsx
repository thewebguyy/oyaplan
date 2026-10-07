import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { SavedPlanService } from '@/lib/services/identity/savedPlanService';
import { GroupService } from '@/lib/services/identity/groupService';
import { getReferralCode } from '@/lib/actions/getReferralCode';
import AccountClient from './AccountClient';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const identity = await SessionResolver.resolveIdentity();
  const isAuthenticated = identity.type === 'authenticated';

  let savedPlansCount = 0;
  let squadCount = 0;
  let referralCode: string | null = null;

  if (isAuthenticated) {
    const userId = identity.profile.id;
    const [savedCount, referralCodeResult, squadsRes] = await Promise.all([
      SavedPlanService.getSavedPlansCount(userId),
      getReferralCode(userId),
      GroupService.getUserGroups(),
    ]);

    savedPlansCount = savedCount;
    referralCode = referralCodeResult;
    squadCount = squadsRes.success && squadsRes.data ? squadsRes.data.length : 0;
  }

  return (
    <AccountClient
      isAuthenticated={isAuthenticated}
      profile={identity.profile}
      savedPlansCount={savedPlansCount}
      squadCount={squadCount}
      referralCode={referralCode}
    />
  );
}
