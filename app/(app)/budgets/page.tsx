import type { Metadata } from 'next';
import { BudgetControl } from '@/components/budgets/budget-control';

export const metadata: Metadata = {
  title: 'Budget Control'
};

export default function BudgetControlPage() {
  return (
    <div className="space-y-6">
      <BudgetControl />
    </div>
  );
}
