import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { jsonError, jsonOk } from '@/lib/http';
import { createRequisition } from '@/lib/services/requisition-service';

const sortRequisitions = (field: string, dir: 'asc' | 'desc') => {
  const multiplier = dir === 'asc' ? 1 : -1;
  return (a: any, b: any) => {
    if (field === 'total') {
      return (a.total - b.total) * multiplier;
    }
    if (field === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
    }
    return String(a[field] ?? '').localeCompare(String(b[field] ?? '')) * multiplier;
  };
};

export async function GET(request: NextRequest) {
  const user = requireUser();
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const { requisitions } = getDb();

  const status = searchParams.get('status');
  const requester = searchParams.get('requester');
  const search = searchParams.get('search');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = Math.max(Number.parseInt(searchParams.get('page') ?? '1', 10), 1);
  const pageSize = Math.max(Number.parseInt(searchParams.get('pageSize') ?? '10', 10), 1);
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') ?? 'desc';

  let filtered = requisitions;
  if (status) {
    filtered = filtered.filter((req) => req.status === status);
  }
  if (requester) {
    filtered = filtered.filter((req) => req.requesterId === requester);
  }
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (req) =>
        req.reqNo.toLowerCase().includes(term) ||
        req.department.toLowerCase().includes(term) ||
        req.costCenter.toLowerCase().includes(term)
    );
  }
  if (from) {
    const fromDate = new Date(from);
    filtered = filtered.filter((req) => new Date(req.createdAt) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    filtered = filtered.filter((req) => new Date(req.createdAt) <= toDate);
  }

  const sorted = filtered.slice().sort(sortRequisitions(sortBy, sortDir));
  const total = sorted.length;
  const offset = (page - 1) * pageSize;
  const paged = sorted.slice(offset, offset + pageSize);

  return jsonOk({
    requisitions: paged,
    page,
    pageSize,
    total,
    user
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = requireUser();
    const body = await request.json();
    const requisition = createRequisition(body, user);
    return jsonOk(requisition, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to create requisition', 400);
  }
}
