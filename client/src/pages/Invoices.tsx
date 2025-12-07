import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Mock Invoice Data
const mockInvoices = [
  { id: "INV-001", client: "Acme Corp", amount: 12500.00, status: "paid", date: "2024-03-01", due: "2024-03-15" },
  { id: "INV-002", client: "Globex Inc", amount: 4500.00, status: "pending", date: "2024-03-10", due: "2024-03-24" },
  { id: "INV-003", client: "Soylent Corp", amount: 2100.00, status: "overdue", date: "2024-02-15", due: "2024-03-01" },
  { id: "INV-004", client: "Initech", amount: 8500.00, status: "draft", date: "2024-03-12", due: "2024-03-26" },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
    case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getStatusIcon(status: string) {
    switch (status) {
    case 'paid': return CheckCircle2;
    case 'pending': return Clock;
    case 'overdue': return AlertCircle;
    default: return FileText;
  }
}

export default function Invoices() {
  return (
    <Layout title="Invoices" description="Manage client billings and payments.">
      <div className="flex justify-end mb-6">
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Track the status of your sent invoices.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Invoice #</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Client</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Issue Date</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Due Date</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Amount</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {mockInvoices.map((invoice) => {
                    const StatusIcon = getStatusIcon(invoice.status);
                    return (
                        <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <td className="p-4 align-middle font-medium">{invoice.id}</td>
                            <td className="p-4 align-middle">{invoice.client}</td>
                            <td className="p-4 align-middle text-muted-foreground">{invoice.date}</td>
                            <td className="p-4 align-middle text-muted-foreground">{invoice.due}</td>
                            <td className="p-4 align-middle">
                            <Badge variant="outline" className={cn("capitalize gap-1", getStatusColor(invoice.status))}>
                                <StatusIcon className="w-3 h-3" />
                                {invoice.status}
                            </Badge>
                            </td>
                            <td className="p-4 align-middle text-right font-medium">
                            ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 align-middle text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </td>
                        </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
