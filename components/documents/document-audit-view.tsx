"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

type DocumentRecord = {
  id: string;
  name: string;
  source: "requisition" | "purchase_order";
  reference: string;
  costCenter?: string;
  uploadedAt: string;
  url: string;
  mime?: string;
  size?: number;
};

type AuditEventRecord = {
  id: string;
  entity: "requisition" | "purchase_order";
  reference: string;
  action: string;
  actor: string;
  role?: string;
  at: string;
  notes?: string;
};

export function DocumentAuditView({
  documents,
  audits,
  userRole
}: {
  documents: DocumentRecord[];
  audits: AuditEventRecord[];
  userRole: string;
}) {
  const [search, setSearch] = React.useState("");
  const [source, setSource] = React.useState<"all" | DocumentRecord["source"]>("all");

  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      const matchesSource = source === "all" || doc.source === source;
      const query = search.toLowerCase();
      const matchesQuery =
        !query ||
        doc.name.toLowerCase().includes(query) ||
        doc.reference.toLowerCase().includes(query) ||
        (doc.costCenter ?? "").toLowerCase().includes(query);
      return matchesSource && matchesQuery;
    });
  }, [documents, search, source]);

  const filteredAudits = React.useMemo(() => {
    if (!search) return audits;
    const query = search.toLowerCase();
    return audits.filter(
      (audit) =>
        audit.reference.toLowerCase().includes(query) ||
        audit.actor.toLowerCase().includes(query) ||
        audit.action.toLowerCase().includes(query) ||
        (audit.notes ?? "").toLowerCase().includes(query)
    );
  }, [audits, search]);

  const totalSize = React.useMemo(() => {
    const bytes = filteredDocuments.reduce((acc, doc) => acc + (doc.size ?? 0), 0);
    if (bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [filteredDocuments]);

  const sourceLabel = (value: DocumentRecord["source"]) =>
    value === "requisition" ? "Requisition" : "Purchase Order";

  const entityLabel = (value: AuditEventRecord["entity"]) =>
    value === "requisition" ? "Requisition" : "Purchase Order";

  const actionLabel = (value: string) => {
    if (value.startsWith("status:")) {
      return `PO Status → ${value.replace("status:", "").replace(/_/g, " ")}`;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Documents &amp; Audit Trail</h2>
        <p className="text-sm text-muted-foreground">
          Central repository for procurement evidence with traceability across requisitions and purchase orders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{filteredDocuments.length}</p>
            <p className="text-xs text-muted-foreground">Filtered results</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Audit events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{filteredAudits.length}</p>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total attachment size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalSize}</p>
            <p className="text-xs text-muted-foreground">Across filtered documents</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Document Library</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track supporting files from requisitions and purchase orders. Filter by source or search by name.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search documents"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="sm:w-56"
            />
            <Select value={source} onValueChange={(value) => setSource(value as typeof source)}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="requisition">Requisitions</SelectItem>
                <SelectItem value="purchase_order">Purchase Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {doc.name}
                      </a>
                    </TableCell>
                    <TableCell>{sourceLabel(doc.source)}</TableCell>
                    <TableCell>{doc.reference}</TableCell>
                    <TableCell>{doc.costCenter ?? "—"}</TableCell>
                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell>{doc.mime ?? "—"}</TableCell>
                    <TableCell>
                      {doc.size
                        ? doc.size < 1024
                          ? `${doc.size} B`
                          : doc.size < 1024 * 1024
                            ? `${(doc.size / 1024).toFixed(1)} KB`
                            : `${(doc.size / (1024 * 1024)).toFixed(1)} MB`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No documents matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.length ? (
                filteredAudits.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{formatDate(event.at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entityLabel(event.entity)}</Badge>
                    </TableCell>
                    <TableCell>{event.reference}</TableCell>
                    <TableCell>{actionLabel(event.action)}</TableCell>
                    <TableCell>
                      <span className="flex flex-col">
                        <span>{event.actor}</span>
                        {event.role ? (
                          <span className="text-xs text-muted-foreground">{event.role.replace("_", " ")}</span>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell>{event.notes ?? "—"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No audit records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className={cn("border-dashed bg-muted/30")}>
        <CardHeader>
          <CardTitle>How to use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            The document library consolidates attachments from requisitions and proof-of-payment from purchase orders, ensuring finance and procurement work from the same evidence base.
          </p>
          <p>
            The audit trail captures approval actions and key PO milestones, providing traceability for compliance reviews and external audits.
          </p>
          <p>
            As a {userRole.replace("_", " ")}, monitor remaining budgets, validate supporting documents, and export files directly from this view when preparing month-end reports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
