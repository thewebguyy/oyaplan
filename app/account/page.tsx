import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { SavedPlanService } from '@/lib/services/identity/savedPlanService';
import { getReferralCode } from '@/lib/actions/getReferralCode';
import AccountClient from './AccountClient';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const identity = await SessionResolver.resolveIdentity();
  const isAuthenticated = identity.type === 'authenticated';

  let savedPlansCount = 0;
  let referralCode: string | null = null;

  if (isAuthenticated) {
    const [savedPlansResult, referralCodeResult] = await Promise.all([
      SavedPlanService.getSavedPlans(),
      getReferralCode(identity.profile.id)
    ]);

    savedPlansCount = savedPlansResult?.success && savedPlansResult.data ? savedPlansResult.data.length : 0;
    referralCode = referralCodeResult;
  }

  return (
    <AccountClient
      isAuthenticated={isAuthenticated}
      profile={identity.profile}
      savedPlansCount={savedPlansCount}
      referralCode={referralCode}
    />
  );
}
