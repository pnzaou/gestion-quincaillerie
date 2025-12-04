import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const loading = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour skeleton */}
        <Skeleton className="h-10 w-40 mb-6" />

        <div className="space-y-8">
          {/* Product Header Skeleton */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image skeleton */}
            <Skeleton className="w-full md:w-64 h-64 rounded-lg" />
            
            {/* Info skeleton */}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>

          {/* Margin Analytics Card Skeleton */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Info Card Skeleton */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prix section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                ))}
              </div>
              
              {/* Stock section */}
              <div className="border-t pt-4 mt-4">
                <Skeleton className="h-5 w-20 mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Date expiration section */}
              <div className="border-t pt-4 mt-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default loading;