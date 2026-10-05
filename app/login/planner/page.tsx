import { redirect } from "next/navigation";

export default async function PlannerLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      queryString.set(key, value);
    }
  }
  const qs = queryString.toString();
  redirect(`/login${qs ? `?${qs}` : ""}`);
}
