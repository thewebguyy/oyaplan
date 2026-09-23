import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
  searchParams?: Promise<{ step?: string }>;
}

export default async function PartnerOnboardingPageRedirect({ params, searchParams }: Props) {
  const { venueId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const stepQuery = sp?.step ? `?step=${sp.step}` : '';
  redirect(`/business/${venueId}/venue${stepQuery}`);
}
