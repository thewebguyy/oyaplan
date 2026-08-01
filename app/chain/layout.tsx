import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { redirect } from 'next/navigation';

export default async function ChainLayout({ children }: { children: React.ReactNode }) {
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated') {
    redirect('/?error=unauthorized_chain');
  }

  return <>{children}</>;
}
