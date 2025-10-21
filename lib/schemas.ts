import { z } from 'zod';
import { ApprovalRoleStep, VendorCategory } from './types';

const vendorCategoryValues: readonly VendorCategory[] = [
  'IT',
  'Office',
  'Logistics',
  'Services',
  'Facilities'
];

const approvalRoleValues: readonly ApprovalRoleStep[] = ['approver', 'finance', 'procurement_admin'];

export const vendorCategoryEnum = z.enum([...vendorCategoryValues] as [VendorCategory, ...VendorCategory[]]);
export const approvalRoleEnum = z.enum([...approvalRoleValues] as [ApprovalRoleStep, ...ApprovalRoleStep[]]);
export const roleEnum = z.enum(['employee', 'approver', 'procurement_admin', 'finance'] as const);

export const fileMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number().nonnegative(),
  mime: z.string(),
  url: z.string().url()
});

export const approvalRuleStepSchema = z.object({
  order: z.number().int().positive(),
  role: approvalRoleEnum
});

export const vendorSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, 'Name is required')
    .max(120),
  email: z.string().email(),
  phone: z.string().min(6),
  category: vendorCategoryEnum,
  rating: z.number().min(1).max(5),
  address: z.string().min(4),
  taxId: z.string(),
  attachments: z.array(fileMetaSchema),
  isActive: z.boolean()
});

export const vendorFormSchema = vendorSchema
  .omit({
    id: true,
    attachments: true
  })
  .extend({
    attachments: z.array(fileMetaSchema).optional()
  });

export const requisitionItemSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  description: z.string().min(3),
  quantity: z.number().positive(),
  uom: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  currency: z.string().length(3),
  category: vendorSchema.shape.category,
  vendorPreferenceId: z.string().optional()
});

export const requisitionSchema = z.object({
  id: z.string(),
  reqNo: z.string(),
  requesterId: z.string(),
  department: z.string(),
  costCenter: z.string(),
  neededBy: z.coerce.date(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'converted']),
  items: z.array(requisitionItemSchema),
  attachments: z.array(fileMetaSchema),
  notes: z.string().optional(),
  total: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  approvalTrail: z.array(
    z.object({
      step: z.number(),
      role: roleEnum,
      userId: z.string().optional(),
      action: z.enum(['submitted', 'approved', 'returned', 'rejected']),
      comment: z.string().optional(),
      at: z.coerce.date()
    })
  ),
  approvalSteps: z.array(approvalRuleStepSchema)
});

export const requisitionFormSchema = z.object({
  department: z.string().min(2, 'Department is required'),
  costCenter: z.string().min(2, 'Cost center is required'),
  neededBy: z.coerce.date({ required_error: 'Needed by date is required' }),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        description: requisitionItemSchema.shape.description,
        quantity: requisitionItemSchema.shape.quantity,
        uom: requisitionItemSchema.shape.uom,
        unitPrice: requisitionItemSchema.shape.unitPrice,
        currency: requisitionItemSchema.shape.currency,
        category: requisitionItemSchema.shape.category,
        vendorPreferenceId: requisitionItemSchema.shape.vendorPreferenceId
      })
    )
    .min(1, 'Add at least one line item'),
  attachments: z.array(fileMetaSchema).optional()
});

export const quoteItemSchema = z.object({
  requisitionItemId: z.string(),
  unitPrice: z.number().nonnegative(),
  currency: z.string().length(3),
  leadTimeDays: z.number().int().nonnegative(),
  notes: z.string().optional()
});

export const quoteSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string().optional(),
  vendorEmail: z.string().email().optional(),
  vendorCompany: z.string().optional(),
  items: z.array(quoteItemSchema),
  subtotal: z.number().nonnegative(),
  taxes: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().nonnegative(),
  leadTimeDays: z.number().int().nonnegative(),
  paymentTerms: z.string(),
  notes: z.string().optional(),
  submittedAt: z.coerce.date().optional(),
  source: z.enum(['admin', 'vendor']).optional()
});

export const rfqSchema = z.object({
  id: z.string(),
  rfqNo: z.string(),
  requisitionId: z.string(),
  vendorIds: z.array(z.string()),
  status: z.enum(['draft', 'sent', 'received', 'closed']),
  quotes: z.array(quoteSchema),
  dueDate: z.coerce.date(),
  createdAt: z.coerce.date()
});

export const rfqFormSchema = z.object({
  requisitionId: z.string().min(1, 'Requisition is required'),
  vendorIds: z.array(z.string()).min(1, 'Select at least one vendor'),
  dueDate: z.coerce
    .date()
    .refine((date) => date > new Date(), 'Due date must be in the future')
});

export const approvalRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  conditions: z
    .object({
      amountGte: z.number().optional(),
      category: vendorCategoryEnum.optional(),
      costCenter: z.string().optional()
    })
    .refine(
      (value) => value.amountGte !== undefined || value.category !== undefined || value.costCenter !== undefined,
      'Specify at least one condition'
    ),
  steps: z.array(approvalRuleStepSchema).min(1, 'Add at least one approval step')
});

export const approvalRuleFormSchema = approvalRuleSchema.omit({
  id: true
});

export const approvalActionSchema = z.object({
  requisitionId: z.string(),
  action: z.enum(['approved', 'returned']),
  comment: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  role: roleEnum
});

export const vendorQuoteSubmissionSchema = z.object({
  vendorName: z.string().min(2, 'Vendor name is required'),
  vendorEmail: z.string().email('Valid email is required'),
  vendorCompany: z.string().optional(),
  paymentTerms: z.string().min(3),
  taxes: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  notes: z.string().optional(),
  items: z.array(
    quoteItemSchema.pick({
      requisitionItemId: true,
      unitPrice: true,
      currency: true,
      leadTimeDays: true,
      notes: true
    })
  ).min(1),
  captchaId: z.string(),
  captchaAnswer: z.number()
});
