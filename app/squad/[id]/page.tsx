import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SquadService } from "@/lib/services/squadService";
import SquadRoomClient from "./SquadRoomClient";
import PageError from "@/components/PageError";

export const dynamic = "force-dynamic";

interface SquadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SquadPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data, notFound: isNotFound } = await SquadService.getSquadRoomData(id);

    if (isNotFound || !data) {
      return { title: "Squad Not Found — OyaPlan" };
    }

    const venueName = data.spot.name || "Lagos Outing";
    const perPerson = data.liveEconomics.perPersonSpend.toLocaleString("en-NG");
    const count = data.confirmedCount > 0 ? data.confirmedCount : data.liveEconomics.originalSquadSize;

    return {
      title: `Squad Outing: ${venueName} (~₦${perPerson} each) — OyaPlan`,
      description: `Join our squad outing at ${venueName}. Estimated ~₦${perPerson} each for ${count} people. Tap "I'm in" to confirm!`,
      openGraph: {
        title: `Squad Outing: ${venueName} (~₦${perPerson} each) — OyaPlan`,
        description: `Join our squad outing at ${venueName}. Estimated ~₦${perPerson} each for ${count} people. Tap "I'm in" to confirm!`,
        images: [
          data.spot.image_url || `${process.env.NEXT_PUBLIC_APP_URL || "https://oyaplan.vercel.app"}/api/og/plan?id=${id}`
        ],
        type: "website",
      },
    };
  } catch {
    return { title: "OyaSquad — OyaPlan" };
  }
}

export default async function SquadPage({ params }: SquadPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const { data, notFound: isNotFound, error } = await SquadService.getSquadRoomData(id);

  if (isNotFound || !data) {
    return (
      <PageError
        message="We could not find this squad outing. The link may have expired or been moved."
        href="/"
        linkLabel="Plan a new outing"
      />
    );
  }

  if (error) {
    return (
      <PageError
        message="An unexpected error occurred while loading this squad room."
        href="/"
        linkLabel="Return to Home"
      />
    );
  }

  return <SquadRoomClient initialData={data} />;
}
