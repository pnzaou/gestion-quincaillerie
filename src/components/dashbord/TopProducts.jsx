"use client"

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, TrendingUp } from 'lucide-react';
import Image from 'next/image';
 
const TopProducts = ({ initialData, shopId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [topProducts, setTopProducts] = useState(initialData || []);
  const [loading, setLoading] = useState(false);

  const periodOptions = [
    { label: "7 derniers jours", value: "7", days: 7 },
    { label: "30 derniers jours", value: "30", days: 30 },
    { label: "90 derniers jours", value: "90", days: 90 },
    { label: "Cette année", value: "365", days: 365 }
  ];

  useEffect(() => {
    // If initialData exists and period is "365" (this year) and initialData matches, we could skip fetch.
    let mounted = true;
    const controller = new AbortController();

    const fetchTop = async () => {
      setLoading(true);
      try {
        const option =
          periodOptions.find((o) => o.value === selectedPeriod) ||
          periodOptions[1];
        const days = option.days;
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        // Use the API route we created
        const res = await fetch(
          `/api/product/top-products?start=${start.toISOString()}&end=${end.toISOString()}&limit=10&businessId=${shopId}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        if (mounted) setTopProducts(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("fetchTopProducts error:", err);
          // Fallback to initialData on error
          if (mounted && initialData) setTopProducts(initialData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // If we have initialData AND selectedPeriod is 365 and initialData is likely the top for year, we could skip fetch.
    // But for simplicity, always fetch so client and server stay consistent.
    fetchTop();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [selectedPeriod, initialData]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);

  const selectedPeriodLabel = periodOptions.find(
    (o) => o.value === selectedPeriod
  )?.label;

  return (
    <Card className="bg-gradient-card border-border shadow-medium">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#65758B]" />
          Top Produits
        </CardTitle>
        <Select
          value={selectedPeriod}
          onValueChange={(v) => setSelectedPeriod(v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Période: {selectedPeriodLabel}
              </p>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center relative overflow-hidden">
                      {product.productImage ? (
                        <Image
                          src={product.productImage}
                          alt={product.productName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.productName}
                      </p>
                      <Badge variant="outline" className="ml-2">
                        #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Réf: {product.productReference}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-sky-600">
                          {product.quantitySold}
                        </span>{" "}
                        vendus
                      </div>
                      <div className="text-xs font-semibold text-success">
                        {product.revenue} fcfa
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};


export default TopProducts;
