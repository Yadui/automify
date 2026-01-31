import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface License {
  id: string;
  licenseKey: string;
  tier: string;
  creditsAdded: number;
  createdAt: Date;
}

interface LicenseHistoryProps {
  licenses: License[];
}

const LicenseHistory: React.FC<LicenseHistoryProps> = ({ licenses }) => {
  if (!licenses || licenses.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold italic font-mono uppercase">
          License History
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      <div className="border border-border rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-mono">LICENSE KEY</TableHead>
              <TableHead className="font-mono">TIER</TableHead>
              <TableHead className="font-mono">CREDITS</TableHead>
              <TableHead className="font-mono">ASSIGNED DATE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.map((license) => (
              <TableRow key={license.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">
                  {license.licenseKey}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {license.tier.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="font-mono">
                  +{license.creditsAdded}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(license.createdAt), "MMM dd, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LicenseHistory;
