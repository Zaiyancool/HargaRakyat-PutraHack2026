import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4 animate-pulse">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-xl p-6 space-y-3 animate-pulse">
      <div className="flex gap-4">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/6" />
        <Skeleton className="h-3 w-1/6" />
        <Skeleton className="h-3 w-1/6" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4 animate-pulse">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}
