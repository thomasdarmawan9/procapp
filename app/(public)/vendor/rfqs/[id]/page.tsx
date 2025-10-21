'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';

interface PublicRfqItem {
  id: string;
  description: string;
  quantity: number;
  uom: string;
  currency: string;
  category: string;
}

interface PublicRfqResponse {
  rfq: {
    id: string;
    rfqNo: string;
    status: string;
    dueDate: string;
    requisition: {
      id: string;
      department: string;
      neededBy: string;
      items: PublicRfqItem[];
    };
  };
  captcha: {
    id: string;
    question: string;
  };
}

interface QuoteItemForm {
  requisitionItemId: string;
  unitPrice: string;
  leadTimeDays: string;
  notes: string;
}

export default function VendorQuoteSubmissionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfqData, setRfqData] = useState<PublicRfqResponse['rfq'] | null>(null);
  const [captcha, setCaptcha] = useState<{ id: string; question: string } | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItemForm[]>([]);
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorCompany, setVendorCompany] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30 days');
  const [shipping, setShipping] = useState('0');
  const [taxes, setTaxes] = useState('0');
  const [notes, setNotes] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/rfqs/${params.id}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data: PublicRfqResponse = await res.json();
      setRfqData(data.rfq);
      setCaptcha(data.captcha);
      setQuoteItems(
        data.rfq.requisition.items.map((item) => ({
          requisitionItemId: item.id,
          unitPrice: '',
          leadTimeDays: '',
          notes: ''
        }))
      );
      setSubmitting(false);
      setSubmitted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFQ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const subtotal = useMemo(() => {
    if (!rfqData) return 0;
    return quoteItems.reduce((acc, item) => {
      const reqItem = rfqData.requisition.items.find((ri) => ri.id === item.requisitionItemId);
      if (!reqItem) return acc;
      const price = Number(item.unitPrice);
      if (Number.isNaN(price)) return acc;
      return acc + reqItem.quantity * price;
    }, 0);
  }, [quoteItems, rfqData]);

  const total = useMemo(() => {
    const shippingValue = Number(shipping) || 0;
    const taxesValue = Number(taxes) || 0;
    return subtotal + shippingValue + taxesValue;
  }, [subtotal, shipping, taxes]);

  const updateItemField = (index: number, field: keyof QuoteItemForm, value: string) => {
    setQuoteItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validateForm = () => {
    if (!rfqData) return 'RFQ not loaded';
    if (!vendorName.trim()) return 'Vendor name is required';
    if (!vendorEmail.trim()) return 'Vendor email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorEmail.trim())) return 'Enter a valid email address';
    if (!paymentTerms.trim()) return 'Payment terms are required';
    if (!captcha || captchaAnswer.trim() === '') return 'Captcha answer is required';
    for (const item of quoteItems) {
      if (!item.unitPrice) return 'Please provide unit prices for all items';
      if (Number(item.unitPrice) < 0) return 'Unit price cannot be negative';
      if (!item.leadTimeDays) return 'Please provide lead time for all items';
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rfqData || !captcha) return;
    const validationError = validateForm();
    if (validationError) {
      setSubmitMessage(validationError);
      return;
    }
    setSubmitting(true);
    setSubmitMessage('');
    try {
      const payload = {
        vendorName: vendorName.trim(),
        vendorEmail: vendorEmail.trim(),
        vendorCompany: vendorCompany.trim() || undefined,
        paymentTerms: paymentTerms.trim(),
        shipping: Number(shipping) || 0,
        taxes: Number(taxes) || 0,
        notes: notes.trim() || undefined,
        captchaId: captcha.id,
        captchaAnswer: Number(captchaAnswer),
        items: quoteItems.map((item) => ({
          requisitionItemId: item.requisitionItemId,
          unitPrice: Number(item.unitPrice),
          leadTimeDays: Number(item.leadTimeDays),
          currency:
            rfqData.requisition.items.find((ri) => ri.id === item.requisitionItemId)?.currency ?? 'IDR',
          notes: item.notes || undefined
        }))
      };

      const res = await fetch(`/api/public/rfqs/${rfqData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      setSubmitted(true);
      setSubmitMessage('Quote submitted successfully. Thank you!');
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : 'Failed to submit quote');
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading RFQ…</CardTitle>
            <CardDescription>Please wait while we prepare the requisition details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !rfqData) {
    return (
      <div className="mx-auto max-w-3xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load RFQ</CardTitle>
            <CardDescription>{error ?? 'RFQ data unavailable.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/vendor')}>
              Back to RFQ lookup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{rfqData.rfqNo}</CardTitle>
          <CardDescription>
            Submit your quotation for department {rfqData.requisition.department}. Required delivery by{' '}
            {new Date(rfqData.requisition.neededBy).toLocaleDateString()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="vendorName">
                Vendor Contact Name
              </label>
              <Input
                id="vendorName"
                placeholder="Your full name"
                value={vendorName}
                onChange={(event) => setVendorName(event.target.value)}
                disabled={submitted}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="vendorEmail">
                Contact Email
              </label>
              <Input
                id="vendorEmail"
                placeholder="name@company.com"
                value={vendorEmail}
                onChange={(event) => setVendorEmail(event.target.value)}
                disabled={submitted}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="vendorCompany">
                Company Name (optional)
              </label>
              <Input
                id="vendorCompany"
                placeholder="Company name"
                value={vendorCompany}
                onChange={(event) => setVendorCompany(event.target.value)}
                disabled={submitted}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="paymentTerms">
                Payment Terms
              </label>
              <Input
                id="paymentTerms"
                placeholder="e.g. 30 days"
                value={paymentTerms}
                onChange={(event) => setPaymentTerms(event.target.value)}
                disabled={submitted}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Line Items</h3>
            <div className="space-y-4">
              {rfqData.requisition.items.map((item, index) => {
                const formItem = quoteItems[index];
                return (
                  <Card key={item.id} className="border border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">{item.description}</CardTitle>
                      <CardDescription>
                        {item.quantity} {item.uom} • Category {item.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium" htmlFor={`unitPrice-${item.id}`}>
                          Unit Price ({item.currency})
                        </label>
                        <Input
                          id={`unitPrice-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={formItem?.unitPrice ?? ''}
                          onChange={(event) => updateItemField(index, 'unitPrice', event.target.value)}
                          disabled={submitted}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium" htmlFor={`leadTime-${item.id}`}>
                          Lead Time (days)
                        </label>
                        <Input
                          id={`leadTime-${item.id}`}
                          type="number"
                          min="0"
                          value={formItem?.leadTimeDays ?? ''}
                          onChange={(event) => updateItemField(index, 'leadTimeDays', event.target.value)}
                          disabled={submitted}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium" htmlFor={`notes-${item.id}`}>
                          Notes (optional)
                        </label>
                        <Textarea
                          id={`notes-${item.id}`}
                          rows={2}
                          value={formItem?.notes ?? ''}
                          onChange={(event) => updateItemField(index, 'notes', event.target.value)}
                          disabled={submitted}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium" htmlFor="shipping">
                Shipping ({rfqData.requisition.items[0]?.currency ?? 'IDR'})
              </label>
              <Input
                id="shipping"
                type="number"
                min="0"
                value={shipping}
                onChange={(event) => setShipping(event.target.value)}
                disabled={submitted}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="taxes">
                Taxes ({rfqData.requisition.items[0]?.currency ?? 'IDR'})
              </label>
              <Input
                id="taxes"
                type="number"
                min="0"
                value={taxes}
                onChange={(event) => setTaxes(event.target.value)}
                disabled={submitted}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="notes">
                Additional Notes
              </label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={submitted}
              />
            </div>
          </div>

          <Separator />

          <div className="rounded-md border bg-muted/20 p-4 text-sm">
            <p>
              <span className="font-semibold">Subtotal:</span> {formatCurrency(subtotal)}
            </p>
            <p>
              <span className="font-semibold">Estimated Total (incl. shipping & taxes):</span>{' '}
              {formatCurrency(total)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Captcha Verification</p>
            <p className="text-sm text-muted-foreground">Please answer to verify you are a human.</p>
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold">{captcha?.question}</span>
              <Input
                className="max-w-[120px]"
                type="number"
                value={captchaAnswer}
                onChange={(event) => setCaptchaAnswer(event.target.value)}
                disabled={submitted}
              />
              <Button variant="outline" type="button" onClick={loadData} disabled={submitting}>
                Refresh
              </Button>
            </div>
          </div>

          {submitMessage ? (
            <p className={cn('text-sm', submitted ? 'text-emerald-600' : 'text-destructive')}>{submitMessage}</p>
          ) : null}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/vendor')} disabled={submitting}>
              Back
            </Button>
            <Button type="submit" disabled={submitted || submitting}>
              {submitting ? 'Submitting…' : submitted ? 'Quote Submitted' : 'Submit Quote'}
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
