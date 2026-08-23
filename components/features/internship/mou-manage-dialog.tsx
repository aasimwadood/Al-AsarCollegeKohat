"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddMouDialog } from "@/components/features/internship/add-mou-dialog";
import { MouStatusSelect } from "@/components/features/internship/mou-status-select";
import { MouDocumentCell } from "@/components/features/internship/mou-document-cell";
import { mouEffectiveStatus, MOU_STATUS_LABELS, MOU_STATUS_VARIANT } from "@/lib/utils/internship";

export type InternshipMou = {
  id: string;
  mouStartDate: string;
  mouExpiryDate: string;
  status: "draft" | "active" | "inactive";
  hasDocument: boolean;
};

export function MouManageDialog({
  companyId,
  companyName,
  mous,
  canManage,
}: {
  companyId: string;
  companyName: string;
  mous: InternshipMou[];
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <FileText className="mr-2 h-4 w-4" />
          MoUs ({mous.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>MoUs — {companyName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {canManage && <AddMouDialog companyId={companyId} />}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Effective Status</TableHead>
                <TableHead>Document</TableHead>
                {canManage && <TableHead>Set Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mous.map((m) => {
                const effective = mouEffectiveStatus(m.status, m.mouExpiryDate);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">
                      {m.mouStartDate} — {m.mouExpiryDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant={MOU_STATUS_VARIANT[effective]}>{MOU_STATUS_LABELS[effective]}</Badge>
                    </TableCell>
                    <TableCell>
                      <MouDocumentCell mouId={m.id} hasDocument={m.hasDocument} canUpload={canManage} />
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <MouStatusSelect mouId={m.id} status={m.status} />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {mous.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 4 : 3} className="py-6 text-center text-sm text-gray-500">
                    No MoUs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
