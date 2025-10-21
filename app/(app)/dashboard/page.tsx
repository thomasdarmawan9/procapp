import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardMetrics } from '@/lib/services/dashboard-service';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ClipboardList, CheckCircle2, FileText, LineChart, Wallet, Building2, ArrowUpRight, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const metrics = getDashboardMetrics();

  const summaryCards = [
    {
      title: 'Open Requisitions',
      value: metrics.requisitions.open.toString(),
      helper: `of ${metrics.requisitions.total}`,
      icon: ClipboardList,
      accent: 'bg-blue-500/10 text-blue-600'
    },
    {
      title: 'Pending Approvals',
      value: metrics.requisitions.pendingApprovals.toString(),
      helper: 'awaiting action',
      icon: FileText,
      accent: 'bg-amber-500/10 text-amber-600'
    },
    {
      title: 'Average Approval Cycle',
      value: `${metrics.requisitions.averageApprovalDays} d`,
      helper: 'from submit to approval',
      icon: CalendarClock,
      accent: 'bg-purple-500/10 text-purple-600'
    },
    {
      title: 'PO Value',
      value: formatCurrency(metrics.pos.totalValue),
      helper: `${metrics.pos.total} active POs`,
      icon: LineChart,
      accent: 'bg-emerald-500/10 text-emerald-600'
    },
    {
      title: 'Spend YTD',
      value: formatCurrency(metrics.spendTotal),
      helper: 'across categories',
      icon: Wallet,
      accent: 'bg-slate-500/10 text-slate-600'
    },
    {
      title: 'RFQs in Progress',
      value: metrics.rfqs.inProgress.toString(),
      helper: `${metrics.rfqs.total} total RFQs`,
      icon: CheckCircle2,
      accent: 'bg-cyan-500/10 text-cyan-600'
    }
  ];

  const budgetProgress = metrics.budget.total
    ? Math.round((metrics.budget.used / metrics.budget.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 lg:col-span-2">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Here’s a snapshot of procurement health this week.</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
              <ArrowUpRight className="h-3 w-3" />
              Last refresh {formatDate(new Date())}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Budget Remaining</p>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.budget.remaining)}</p>
              <p className="text-xs text-muted-foreground">of {formatCurrency(metrics.budget.total)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Top Vendor</p>
              <p className="text-2xl font-semibold">
                {metrics.vendors.top.length ? metrics.vendors.top[0].name : '—'}
              </p>
              {metrics.vendors.top.length ? (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(metrics.vendors.top[0].total)} awarded
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Approvals SLA</p>
              <p className="text-2xl font-semibold">{metrics.requisitions.averageApprovalDays} days</p>
              <p className="text-xs text-muted-foreground">average across completed flows</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-emerald-600" />
              Budget Utilisation
            </CardTitle>
            <CardDescription className="text-xs">Monitor spend against approved allocations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs uppercase">
                <span>Used</span>
                <span>{budgetProgress}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-emerald-900/10">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-3">
              {metrics.budget.summaries.map((budget) => {
                const utilisation = budget.amount ? Math.round(((budget.amount - budget.remaining) / budget.amount) * 100) : 0;
                return (
                  <div key={budget.id} className="rounded-lg border border-emerald-500/20 p-3">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{budget.name}</span>
                      <span>{utilisation}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Remaining {formatCurrency(budget.remaining)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} className="overflow-hidden">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.helper}</p>
              </div>
              <div className={cn('rounded-full p-3', card.accent)}>
                <card.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Requisitions</CardTitle>
            <CardDescription>Latest requests entering the workflow.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">Req No</th>
                  <th className="py-2 font-medium">Department</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent.requisitions.map((req) => (
                  <tr key={req.id} className="border-t last:border-b">
                    <td className="py-2 font-medium">{req.reqNo}</td>
                    <td className="py-2">{req.department}</td>
                    <td className="py-2">
                      <Badge variant="outline">{req.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-2">{formatCurrency(req.total)}</td>
                    <td className="py-2 text-muted-foreground">{formatDate(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Key audit events and approvals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.activity.audits.map((event) => (
              <div key={event.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium">{event.reference}</p>
                <p className="text-xs text-muted-foreground">
                  {event.actor} · {event.role?.replace('_', ' ') ?? 'System'}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(event.at)}</p>
                <p className="mt-1 text-xs">
                  {event.action.startsWith('status:')
                    ? `PO status changed to ${event.action.replace('status:', '').replace(/_/g, ' ')}`
                    : event.action}
                </p>
                {event.notes ? <p className="mt-1 text-xs text-muted-foreground">“{event.notes}”</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Spend</CardTitle>
            <CardDescription>Where procurement value is concentrated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.vendors.top.map((vendor, index) => (
              <div key={vendor.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(vendor.total)}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
            ))}
            {!metrics.vendors.top.length ? (
              <p className="text-sm text-muted-foreground">No vendor spend recorded yet.</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest Purchase Orders</CardTitle>
            <CardDescription>Recent commitments issued to suppliers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recent.pos.map((po) => (
              <div key={po.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{po.poNo}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(po.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(po.total)}</p>
                  <p className="text-xs text-muted-foreground">{po.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
