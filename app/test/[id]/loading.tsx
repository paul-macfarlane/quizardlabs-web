import { Skeleton } from "@/components/ui/skeleton";

export default function TestLoading() {
  return (
    <div className="min-h-screen bg-muted">
      <div className="h-16 border-b bg-background" />
      <main className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    </div>
  );
}
