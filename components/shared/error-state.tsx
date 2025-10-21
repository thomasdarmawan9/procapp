"use client";

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{message}</div>;
}
