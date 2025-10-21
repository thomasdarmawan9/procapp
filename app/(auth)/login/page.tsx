import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">Select a role to explore the procurement workspace.</p>
        <LoginForm />
      </div>
    </div>
  );
}
