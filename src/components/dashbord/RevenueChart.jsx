"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const RevenueChart = ({ initialData }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(initialData?.year || currentYear);
    const [revenueData, setRevenueData] = useState(initialData || null);
    const [loading, setLoading] = useState(false);

    const availableYears = Array.from({ length: 3 }, (_, i) => currentYear - i);

    useEffect(() => {
      // si initialData correspond déjà à l'année sélectionnée, pas besoin de re-fetch
      if (initialData && initialData.year === selectedYear) {
        setRevenueData(initialData);
        return;
      }

      let mounted = true;
      const controller = new AbortController();
      const fetchRevenue = async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `/api/sale/yearly-revenue?year=${selectedYear}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Erreur réseau");
          const data = await res.json();
          if (mounted) setRevenueData(data);
        } catch (err) {
          if (err.name !== "AbortError")
            console.error("fetchRevenue error:", err);
        } finally {
          if (mounted) setLoading(false);
        }
      };
      fetchRevenue();
      return () => {
        mounted = false;
        controller.abort();
      };
    }, [selectedYear, initialData]);

    const chartData = (revenueData?.months || []).map((m, i) => ({
        month: m,
        revenue: (revenueData.revenues && revenueData.revenues[i]) || 0
    }));

    return (
      <Card className="bg-gradient-card border-border shadow-medium">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            Revenus Mensuels
          </CardTitle>
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          {loading || !revenueData ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-2xl font-bold text-sky-600">
                  {revenueData.total} fcfa
                </p>
                <p className="text-sm text-muted-foreground">
                  Total pour {selectedYear}
                </p>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [value+" fcfa", "Revenus"]}
                    labelStyle={{ color: "var(--foreground)" }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0084D1"
                    strokeWidth={3}
                    dot={{ fill: "#0084D1", strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: "#0084D1",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>
    );
}

export default RevenueChart;
