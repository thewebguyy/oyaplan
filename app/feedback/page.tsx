import { Metadata } from "next";
import { getActiveAreas } from "@/lib/queries/areas";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Tell Us Your Mind — OyaPlan Lagos",
  description: "Help us build the ultimate Lagos playbook. No filters, just facts.",
};

export default async function FeedbackPage() {
  const { data: areas } = await getActiveAreas();

  return <FeedbackForm areas={areas ?? []} />;
}
