import { Skeleton } from "@/components/ui/skeleton";

export default function PlanLoading() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-normal motion-reduce:duration-0">
      <div className="space-y-10">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>

        {/* Plan Facts Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2 items-center p-4 rounded-xl border border-border">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>

        {/* Budget Section Skeleton */}
        <div className="p-8 rounded-2xl border border-border space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border flex justify-between items-center">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <Skeleton className="h-12 w-full sm:w-48" />
          <Skeleton className="h-12 w-full sm:w-48" />
        </div>
      </div>
    </div>
  );
}
