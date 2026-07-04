import { SessionResolver } from '@/lib/services/identity/sessionResolver';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const identity = await SessionResolver.resolveIdentity();

  if (identity.type !== 'authenticated') {
    redirect('/?error=unauthorized_dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
