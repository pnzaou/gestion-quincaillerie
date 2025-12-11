import { ProductHeader } from "@/components/dashbord/Product-header";
import { ProductInfoCard } from "@/components/dashbord/Product-info-card";
import { MarginAnalyticsCard } from "@/components/dashbord/Margin-analytics-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProductAnalytics } from "@/lib/productDetailsData";

const Page = async ({ params }) => {
  const { id, shopId } = await params;

  const data = await getProductAnalytics(id);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">Produit introuvable</p>
      </div>
    );
  }

  const { product, analytics } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href={`/shop/${shopId}/dashboard/article/stock`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>

        <div className="space-y-8">
          <ProductHeader product={product} />
          <MarginAnalyticsCard analytics={analytics} />
          <ProductInfoCard product={product} />
        </div>
      </div>
    </div>
  );
};

export default Page;