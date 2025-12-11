import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/lib/components/navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-muted">
      <Navbar userEmail="" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    </div>
  );
}
