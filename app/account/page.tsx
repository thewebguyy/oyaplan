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
    const userId = identity.profile.id;
    const [savedCount, referralCodeResult] = await Promise.all([
      SavedPlanService.getSavedPlansCount(userId),
      getReferralCode(userId)
    ]);

    savedPlansCount = savedCount;
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
