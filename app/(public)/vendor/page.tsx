'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function VendorPortalLanding() {
  const router = useRouter();
  const [rfqId, setRfqId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rfqId.trim()) {
      setError('Please enter the RFQ ID provided in your invitation email.');
      return;
    }
    setError('');
    router.push(`/vendor/rfqs/${rfqId.trim()}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Quote Submission</CardTitle>
          <CardDescription>
            Enter the RFQ identifier you received to review requirements and submit your quotation. No login required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="rfqId" className="text-sm font-medium">
                RFQ ID
              </label>
              <Input
                id="rfqId"
                placeholder="e.g. RFQ-2024-011"
                value={rfqId}
                onChange={(event) => setRfqId(event.target.value)}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <Button type="submit">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
