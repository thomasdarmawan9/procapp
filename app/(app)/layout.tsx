import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell key={user.id} initialUser={user}>
      {children}
    </AppShell>
  );
}
