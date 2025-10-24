"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardMetrics } from "@/types/dashboard";
import { useTranslation } from "@/hooks/use-translation";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#db2777", "#0ea5e9"];

export function DashboardCharts({ metrics }: { metrics: DashboardMetrics }) {
  const { locale } = useTranslation();
  const spendData = Object.entries(metrics.spendByCategory).map(([category, total]) => ({ category, total }));
  const poData = Object.entries(metrics.pos.status).map(([status, value]) => ({ status, value }));
  const approvalsData = Object.entries(metrics.approvals).map(([role, total]) => ({ role, total }));
  const poTrend = metrics.pos.trend;
  const maxPoTrend = poTrend.reduce((acc, item) => Math.max(acc, item.amount), 0);
  const poTrendDomain: [number, number] = maxPoTrend > 0 ? [0, Math.ceil(maxPoTrend * 1.2)] : [0, 1];
  const maxSpend = spendData.reduce((acc, item) => Math.max(acc, item.total), 0);
  const spendDomain = maxSpend > 0 ? [0, Math.ceil(maxSpend * 1.2)] : [0, 1];

  const formatCompactByLocale = (value: number) => {
    if (!value) return "0";
    const abs = Math.abs(value);
    const toFixedTrim = (num: number) => {
      const str = num.toFixed(1);
      return str.endsWith(".0") ? str.slice(0, -2) : str;
    };
    if (locale === "id") {
      if (abs >= 1_000_000_000) return `${toFixedTrim(value / 1_000_000_000)} Miliar`;
      if (abs >= 1_000_000) return `${toFixedTrim(value / 1_000_000)} Juta`;
      if (abs >= 1_000) return `${toFixedTrim(value / 1_000)} Ribu`;
      return `${value}`;
    }
    if (abs >= 1_000_000_000) return `${toFixedTrim(value / 1_000_000_000)}B`;
    if (abs >= 1_000_000) return `${toFixedTrim(value / 1_000_000)}M`;
    if (abs >= 1_000) return `${toFixedTrim(value / 1_000)}K`;
    return `${value}`;
  };

  const formatYAxisNumber = (value: number) => formatCompactByLocale(value as number);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Total Spend by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendData}>
              <XAxis dataKey="category" tickLine={false} axisLine={false} />
              <YAxis domain={spendDomain} tickFormatter={formatCompactByLocale} width={100} />
              <Tooltip formatter={(value: number) => formatCurrency(value, 'IDR', locale === 'id' ? 'id-ID' : 'en-ID')} />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>PO Status</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={poData} dataKey="value" nameKey="status" innerRadius={50} outerRadius={80}>
                {poData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Purchase Order Value Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={poTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={poTrendDomain} tickFormatter={formatYAxisNumber} width={100} allowDecimals={false} />
              <Tooltip formatter={(value: number) => formatCurrency(value, 'IDR', locale === 'id' ? 'id-ID' : 'en-ID')} />
              <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Pending Approvals by Role</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={approvalsData}>
              <XAxis dataKey="role" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
