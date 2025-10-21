import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getCurrentUser } from '@/lib/auth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <AppShell initialUser={user}>{children}</AppShell>;
}
