import { requireUser } from '@/lib/auth';
import { jsonOk } from '@/lib/http';
import { listBudgetSummaries } from '@/lib/services/budget-service';

export async function GET() {
  requireUser();
  const budgets = listBudgetSummaries();
  return jsonOk({ budgets });
}
