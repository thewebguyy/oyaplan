import LoadingState from "@/components/LoadingState";

export default function ForgeLoading() {
  return (
    <main className="min-h-screen bg-surface-grey flex items-center justify-center py-8 px-4">
      <LoadingState />
    </main>
  );
}
