import { uuid } from './utils';
import {
  ApprovalRule,
  Budget,
  PO,
  RFQ,
  Requisition,
  User,
  Vendor,
  VendorCategory
} from './types';

type Database = {
  users: User[];
  vendors: Vendor[];
  requisitions: Requisition[];
  rfqs: RFQ[];
  pos: PO[];
  approvalRules: ApprovalRule[];
  budgets: Budget[];
};

declare global {
  // eslint-disable-next-line no-var
  var __PROC_DB__: Database | undefined;
}

const categories: VendorCategory[] = ['IT', 'Office', 'Logistics', 'Services', 'Facilities'];

const seedVendors = (): Vendor[] => [
  {
    id: uuid(),
    name: 'Nusantara Tech Supplies',
    email: 'contact@nusantaratech.co.id',
    phone: '+62-21-555-1000',
    category: 'IT',
    rating: 5,
    address: 'Jl. Sudirman Kav. 21, Jakarta',
    taxId: '01.234.567.8-999.000',
    attachments: [],
    isActive: true
  },
  {
    id: uuid(),
    name: 'Sahabat Office Mart',
    email: 'sales@sahabatoffice.id',
    phone: '+62-21-777-2211',
    category: 'Office',
    rating: 4,
    address: 'Jl. Gatot Subroto No. 45, Jakarta',
    taxId: '02.987.654.3-888.000',
    attachments: [],
    isActive: true
  },
  {
    id: uuid(),
    name: 'LogiXpress Indonesia',
    email: 'hello@logixpress.id',
    phone: '+62-21-333-9021',
    category: 'Logistics',
    rating: 4,
    address: 'Jl. Raya Bekasi Timur No. 77, Bekasi',
    taxId: '03.321.123.5-777.000',
    attachments: [],
    isActive: true
  },
  {
    id: uuid(),
    name: 'Prima IT Solutions',
    email: 'marketing@primait.co.id',
    phone: '+62-21-889-5512',
    category: 'IT',
    rating: 3,
    address: 'Jl. Thamrin No. 18, Jakarta',
    taxId: '04.555.901.2-666.000',
    attachments: [],
    isActive: true
  },
  {
    id: uuid(),
    name: 'QuickFix Facility Services',
    email: 'support@quickfixfacilities.id',
    phone: '+62-21-889-1122',
    category: 'Facilities',
    rating: 5,
    address: 'Jl. Daan Mogot No. 90, Jakarta',
    taxId: '05.777.888.1-555.000',
    attachments: [],
    isActive: true
  },
  {
    id: uuid(),
    name: 'Satria Logistics',
    email: 'info@satrialogistics.id',
    phone: '+62-21-665-4433',
    category: 'Logistics',
    rating: 4,
    address: 'Jl. Pelabuhan No. 7, Surabaya',
    taxId: '06.999.222.0-444.000',
    attachments: [],
    isActive: false
  }
];

const seedUsers = (): User[] => [
  {
    id: 'user-employee',
    name: 'Employee A',
    role: 'employee',
    email: 'employee@example.com'
  },
  {
    id: 'user-approver',
    name: 'Manager B',
    role: 'approver',
    email: 'approver@example.com'
  },
  {
    id: 'user-procurement',
    name: 'Citra Prasetyo',
    role: 'procurement_admin',
    email: 'procurement@example.com'
  },
  {
    id: 'user-finance',
    name: 'Dito Wijaya',
    role: 'finance',
    email: 'finance@example.com'
  }
];

const createBudgets = (): Budget[] => [
  {
    id: uuid(),
    name: 'IT Operations 2024',
    costCenter: 'IT-OPS-001',
    amount: 1_200_000_000,
    currency: 'IDR',
    period: 'FY2024'
  },
  {
    id: uuid(),
    name: 'Facilities Upgrade 2024',
    costCenter: 'FAC-202',
    amount: 600_000_000,
    currency: 'IDR',
    period: 'FY2024'
  },
  {
    id: uuid(),
    name: 'Operations Improvements 2024',
    costCenter: 'OPS-110',
    amount: 450_000_000,
    currency: 'IDR',
    period: 'FY2024'
  },
  {
    id: uuid(),
    name: 'Logistics Fleet 2024',
    costCenter: 'LOG-450',
    amount: 500_000_000,
    currency: 'IDR',
    period: 'FY2024'
  }
];

const calculateTotal = (items: Requisition['items']) =>
  items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

const createRequisitions = (users: User[], vendors: Vendor[]): Requisition[] => {
  const now = new Date();
  const requisitions: Requisition[] = [
    {
      id: uuid(),
      reqNo: 'PR-2024-0001',
      requesterId: users[0].id,
      department: 'IT',
      costCenter: 'IT-OPS-001',
      neededBy: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      status: 'approved',
      items: [
        {
          id: uuid(),
          description: 'Enterprise Laptops',
          quantity: 10,
          uom: 'unit',
          unitPrice: 25000000,
          currency: 'IDR',
          category: 'IT',
          vendorPreferenceId: vendors[0].id
        },
        {
          id: uuid(),
          description: 'Docking Stations',
          quantity: 10,
          uom: 'unit',
          unitPrice: 2500000,
          currency: 'IDR',
          category: 'IT',
          vendorPreferenceId: vendors[0].id
        }
      ],
      attachments: [],
      notes: 'Refresh equipment for new hires',
      approvalTrail: [
        {
          step: 0,
          role: 'employee',
          action: 'submitted',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
          userId: users[0].id
        },
        {
          step: 1,
          role: 'approver',
          action: 'approved',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6),
          userId: users[1].id
        },
        {
          step: 2,
          role: 'finance',
          action: 'approved',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
          userId: users[3].id
        }
      ],
      approvalSteps: [
        { order: 1, role: 'approver' },
        { order: 2, role: 'finance' }
      ],
      total: 10 * 25000000 + 10 * 2500000,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      id: uuid(),
      reqNo: 'PR-2024-0002',
      requesterId: users[0].id,
      department: 'Facilities',
      costCenter: 'FAC-202',
      neededBy: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
      status: 'submitted',
      items: [
        {
          id: uuid(),
          description: 'Office Chairs',
          quantity: 30,
          uom: 'unit',
          unitPrice: 1500000,
          currency: 'IDR',
          category: 'Office',
          vendorPreferenceId: vendors[1].id
        },
        {
          id: uuid(),
          description: 'Standing Desks',
          quantity: 20,
          uom: 'unit',
          unitPrice: 4500000,
          currency: 'IDR',
          category: 'Office',
          vendorPreferenceId: vendors[1].id
        }
      ],
      attachments: [],
      approvalTrail: [
        {
          step: 0,
          role: 'employee',
          action: 'submitted',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
          userId: users[0].id
        },
        {
          step: 1,
          role: 'approver',
          action: 'approved',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
          userId: users[1].id
        }
      ],
      approvalSteps: [
        { order: 1, role: 'approver' },
        { order: 2, role: 'procurement_admin' }
      ],
      notes: 'Office expansion level 12',
      total: 30 * 1500000 + 20 * 4500000,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)
    },
    {
      id: uuid(),
      reqNo: 'PR-2024-0003',
      requesterId: users[0].id,
      department: 'Operations',
      costCenter: 'OPS-110',
      neededBy: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30),
      status: 'draft',
      items: [
        {
          id: uuid(),
          description: 'Warehouse Shelving',
          quantity: 50,
          uom: 'unit',
          unitPrice: 1200000,
          currency: 'IDR',
          category: 'Logistics',
          vendorPreferenceId: vendors[2].id
        }
      ],
      attachments: [],
      approvalTrail: [],
      approvalSteps: [],
      total: 50 * 1200000,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1)
    },
    {
      id: uuid(),
      reqNo: 'PR-2024-0004',
      requesterId: users[0].id,
      department: 'IT',
      costCenter: 'IT-OPS-001',
      neededBy: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      status: 'rejected',
      items: [
        {
          id: uuid(),
          description: 'Network Switches',
          quantity: 5,
          uom: 'unit',
          unitPrice: 7000000,
          currency: 'IDR',
          category: 'IT',
          vendorPreferenceId: vendors[3].id
        }
      ],
      attachments: [],
      approvalTrail: [
        {
          step: 0,
          role: 'employee',
          action: 'submitted',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12),
          userId: users[0].id
        },
        {
          step: 1,
          role: 'approver',
          action: 'returned',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 11),
          comment: 'Please provide justification for upgrade.'
        }
      ],
      approvalSteps: [
        { order: 1, role: 'approver' }
      ],
      notes: 'Upgrade for network backbone',
      total: 5 * 7000000,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 13),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 11)
    },
    {
      id: uuid(),
      reqNo: 'PR-2024-0005',
      requesterId: users[0].id,
      department: 'Logistics',
      costCenter: 'LOG-450',
      neededBy: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      status: 'converted',
      items: [
        {
          id: uuid(),
          description: 'Delivery Vans Leasing',
          quantity: 3,
          uom: 'unit',
          unitPrice: 90000000,
          currency: 'IDR',
          category: 'Logistics',
          vendorPreferenceId: vendors[5].id
        }
      ],
      attachments: [],
      approvalTrail: [
        {
          step: 0,
          role: 'employee',
          action: 'submitted',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20),
          userId: users[0].id
        },
        {
          step: 1,
          role: 'approver',
          action: 'approved',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 19),
          userId: users[1].id
        },
        {
          step: 2,
          role: 'finance',
          action: 'approved',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 18),
          userId: users[3].id
        },
        {
          step: 3,
          role: 'procurement_admin',
          action: 'approved',
          at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 17),
          userId: users[2].id
        }
      ],
      approvalSteps: [
        { order: 1, role: 'approver' },
        { order: 2, role: 'finance' },
        { order: 3, role: 'procurement_admin' }
      ],
      notes: 'Leasing for new distribution channel',
      total: 3 * 90000000,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 25),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 17)
    }
  ];

  return requisitions.map((req) => ({
    ...req,
    total: calculateTotal(req.items)
  }));
};

const createApprovalRules = (): ApprovalRule[] => [
  {
    id: uuid(),
    name: 'Default approval up to 50M',
    conditions: {
      amountGte: 0
    },
    steps: [
      { order: 1, role: 'approver' },
      { order: 2, role: 'procurement_admin' }
    ]
  },
  {
    id: uuid(),
    name: 'High value requires finance',
    conditions: {
      amountGte: 100_000_000
    },
    steps: [
      { order: 1, role: 'approver' },
      { order: 2, role: 'finance' },
      { order: 3, role: 'procurement_admin' }
    ]
  },
  {
    id: uuid(),
    name: 'IT Cost Center special rule',
    conditions: {
      costCenter: 'IT-OPS-001',
      category: 'IT'
    },
    steps: [
      { order: 1, role: 'approver' },
      { order: 2, role: 'finance' }
    ]
  }
];

const createRfq = (requisitions: Requisition[], vendors: Vendor[]): RFQ[] => {
  const approvedReq = requisitions.find((req) => req.status === 'approved');
  const submittedReq = requisitions.find((req) => req.status === 'submitted');
  if (!approvedReq || !submittedReq) {
    return [];
  }

  return [
    {
      id: uuid(),
      rfqNo: 'RFQ-2024-010',
      requisitionId: approvedReq.id,
      vendorIds: vendors.slice(0, 3).map((v) => v.id),
      status: 'draft',
      quotes: [],
      dueDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
      createdAt: new Date()
    },
    {
      id: uuid(),
      rfqNo: 'RFQ-2024-011',
      requisitionId: submittedReq.id,
      vendorIds: vendors.slice(1, 4).map((v) => v.id),
      status: 'received',
      quotes: vendors.slice(1, 4).map((vendor, index) => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        vendorCompany: vendor.name,
        items: submittedReq.items.map((item) => ({
          requisitionItemId: item.id,
          unitPrice: item.unitPrice * (1 + index * 0.05),
          currency: item.currency,
          leadTimeDays: 7 + index * 2
        })),
        subtotal: submittedReq.total * (1 + index * 0.05),
        taxes: submittedReq.total * 0.11,
        shipping: 500000 * (index + 1),
        total:
          submittedReq.total * (1 + index * 0.05) +
          submittedReq.total * 0.11 +
          500000 * (index + 1),
        leadTimeDays: 7 + index * 2,
        paymentTerms: '30 days',
        notes: index === 0 ? 'Best lead time' : undefined,
        submittedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 12 * (index + 1)),
        source: 'vendor'
      })),
      dueDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
      createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5)
    }
  ];
};

const createPOs = (requisitions: Requisition[], vendors: Vendor[]): PO[] => {
  const approvedReq = requisitions.find((req) => req.status === 'approved');
  const convertedReq = requisitions.find((req) => req.status === 'converted');

  return [
    {
      id: uuid(),
      poNo: 'PO-2024-020',
      vendorId: vendors[0].id,
      status: 'draft',
      lines: approvedReq
        ? approvedReq.items.map((item) => ({
            requisitionItemId: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        : [],
      total: approvedReq ? approvedReq.total : 0,
      currency: 'IDR',
      terms: 'Delivery within 14 days',
      linkedRequisitionIds: approvedReq ? [approvedReq.id] : [],
      createdAt: new Date(),
      paymentProofs: []
    },
    {
      id: uuid(),
      poNo: 'PO-2024-021',
      vendorId: vendors[1].id,
      status: 'issued',
      lines: convertedReq
        ? convertedReq.items.map((item) => ({
            requisitionItemId: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        : [],
      total: convertedReq ? convertedReq.total : 0,
      currency: 'IDR',
      terms: 'Delivery within 30 days',
      linkedRequisitionIds: convertedReq ? [convertedReq.id] : [],
      createdAt: new Date(),
      paymentProofs: []
    },
    {
      id: uuid(),
      poNo: 'PO-2024-022',
      vendorId: vendors[2].id,
      status: 'closed',
      lines: [
        {
          requisitionItemId: requisitions[0]?.items[0]?.id ?? uuid(),
          quantity: 10,
          unitPrice: 1500000,
          total: 15000000
        }
      ],
      total: 15000000,
      currency: 'IDR',
      terms: 'Delivered complete',
      linkedRequisitionIds: [requisitions[0]?.id ?? uuid()],
      createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30),
      paymentProofs: []
    }
  ];
};

const seedData = (): Database => {
  const users = seedUsers();
  const vendors = seedVendors();
  const requisitions = createRequisitions(users, vendors);
  const rfqs = createRfq(requisitions, vendors);
  const pos = createPOs(requisitions, vendors);
  const approvalRules = createApprovalRules();
  const budgets = createBudgets();

  return {
    users,
    vendors,
    requisitions,
    rfqs,
    pos,
    approvalRules,
    budgets
  };
};

export const getDb = (): Database => {
  if (!globalThis.__PROC_DB__) {
    globalThis.__PROC_DB__ = seedData();
  }
  return globalThis.__PROC_DB__;
};

export const resetDb = () => {
  globalThis.__PROC_DB__ = seedData();
};

export const categoriesList = () => categories;
