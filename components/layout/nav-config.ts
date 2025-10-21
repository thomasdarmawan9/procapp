import en from "@/locales/en.json";
import type { Role } from "@/lib/types";

export type NavItem = {
  labelKey: keyof typeof en;
  href: string;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard" },
  { labelKey: "nav.requisitions", href: "/requisitions" },
  { labelKey: "nav.pos", href: "/pos" },
  { labelKey: "nav.rfqs", href: "/rfqs" },
  { labelKey: "nav.documents", href: "/documents", roles: ["finance", "procurement_admin"] },
  { labelKey: "nav.approvals", href: "/approvals", roles: ["approver", "finance", "procurement_admin"] },
  { labelKey: "nav.vendors", href: "/vendors", roles: ["procurement_admin"] },
  { labelKey: "nav.settings", href: "/settings/approval-rules", roles: ["procurement_admin"] }
];
