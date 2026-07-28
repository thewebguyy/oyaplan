import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { SavedPlanService } from '@/lib/services/identity/savedPlanService';
import { getReferralCode } from '@/lib/actions/getReferralCode';
import AccountClient from './AccountClient';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const identity = await SessionResolver.resolveIdentity();
  const isAuthenticated = identity.type === 'authenticated';

  const savedPlansResult = isAuthenticated ? await SavedPlanService.getSavedPlans() : null;
  const savedPlansCount = savedPlansResult?.success && savedPlansResult.data ? savedPlansResult.data.length : 0;

  const referralCode = isAuthenticated ? await getReferralCode() : null;

  return (
    <AccountClient
      isAuthenticated={isAuthenticated}
      profile={identity.profile}
      savedPlansCount={savedPlansCount}
      referralCode={referralCode}
    />
  );
}
