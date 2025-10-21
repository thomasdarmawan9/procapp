"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardMetrics } from "@/types/dashboard";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#db2777", "#0ea5e9"];

export function DashboardCharts({ metrics }: { metrics: DashboardMetrics }) {
  const spendData = Object.entries(metrics.spendByCategory).map(([category, total]) => ({ category, total }));
  const poData = Object.entries(metrics.pos.status).map(([status, value]) => ({ status, value }));
  const approvalsData = Object.entries(metrics.approvals).map(([role, total]) => ({ role, total }));
  const poTrend = metrics.pos.trend;
  const maxSpend = spendData.reduce((acc, item) => Math.max(acc, item.total), 0);
  const spendDomain = maxSpend > 0 ? [0, Math.ceil(maxSpend * 1.2)] : [0, 1];

  const formatCompactCurrency = (value: number) => {
    if (!value) return "Rp 0";
    const compact = new Intl.NumberFormat("en-ID", {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
    return `Rp ${compact}`;
  };

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
              <YAxis domain={spendDomain} tickFormatter={formatCompactCurrency} width={80} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={poTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value).replace(/[,₹$]/g, "")} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
