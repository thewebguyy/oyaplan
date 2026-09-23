import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ venueId: string }>;
}

export default async function PartnerPricingPageRedirect({ params }: Props) {
  const { venueId } = await params;
  redirect(`/business/${venueId}/pricing`);
}
