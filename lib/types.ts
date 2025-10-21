export type Role = 'employee' | 'approver' | 'procurement_admin' | 'finance';

export interface FileMeta {
  id: string;
  name: string;
  size: number;
  mime: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export type VendorCategory = 'IT' | 'Office' | 'Logistics' | 'Services' | 'Facilities';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: VendorCategory;
  rating: number;
  address: string;
  taxId: string;
  attachments: FileMeta[];
  isActive: boolean;
}

export interface Budget {
  id: string;
  name: string;
  costCenter: string;
  amount: number;
  currency: string;
  period: string;
}

export interface RequisitionItem {
  id: string;
  sku?: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  currency: string;
  category: VendorCategory;
  vendorPreferenceId?: string;
}

export type RequisitionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';

export interface ApprovalEvent {
  step: number;
  role: Role;
  userId?: string;
  action: 'submitted' | 'approved' | 'returned' | 'rejected';
  comment?: string;
  at: Date;
}

export interface Requisition {
  id: string;
  reqNo: string;
  requesterId: string;
  department: string;
  costCenter: string;
  neededBy: Date;
  status: RequisitionStatus;
  items: RequisitionItem[];
  attachments: FileMeta[];
  notes?: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  approvalTrail: ApprovalEvent[];
  approvalSteps: ApprovalRuleStep[];
}

export interface QuoteItem {
  requisitionItemId: string;
  unitPrice: number;
  currency: string;
  leadTimeDays: number;
  notes?: string;
}

export interface Quote {
  vendorId: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorCompany?: string;
  items: QuoteItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
  leadTimeDays: number;
  paymentTerms: string;
  notes?: string;
  submittedAt?: Date;
  source?: 'admin' | 'vendor';
}

export type RfqStatus = 'draft' | 'sent' | 'received' | 'closed';

export interface RFQ {
  id: string;
  rfqNo: string;
  requisitionId: string;
  vendorIds: string[];
  status: RfqStatus;
  quotes: Quote[];
  dueDate: Date;
  createdAt: Date;
}

export interface POLine {
  requisitionItemId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type POStatus = 'draft' | 'issued' | 'partially_received' | 'closed' | 'canceled';

export interface PO {
  id: string;
  poNo: string;
  vendorId: string;
  status: POStatus;
  lines: POLine[];
  total: number;
  currency: string;
  terms: string;
  linkedRequisitionIds: string[];
  createdAt: Date;
  paymentProofs?: FileMeta[];
}

export type ApprovalRoleStep = 'approver' | 'finance' | 'procurement_admin';

export interface ApprovalRuleStep {
  order: number;
  role: ApprovalRoleStep;
}

export interface ApprovalRuleConditions {
  amountGte?: number;
  category?: VendorCategory;
  costCenter?: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  conditions: ApprovalRuleConditions;
  steps: ApprovalRuleStep[];
}

export interface ApprovalInboxItem {
  requisitionId: string;
  requisition: Requisition;
  currentStep: ApprovalRuleStep;
  dueDate?: Date;
}
