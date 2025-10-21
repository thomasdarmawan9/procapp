import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-muted/10 py-10">{children}</div>;
}
