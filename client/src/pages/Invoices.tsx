import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useData, Invoice } from "@/lib/dataContext";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, FileText, CheckCircle2, Clock, AlertCircle, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CreateInvoiceDialog() {
  const { addInvoice } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    addInvoice({
      client: formData.get("client") as string,
      amount: parseFloat(formData.get("amount") as string),
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.get("dueDate") as string,
      status: "draft"
    });

    setOpen(false);
    toast({ title: "Invoice Created", description: "New invoice has been added to drafts." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>Bill a client or customer.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client Name</Label>
              <Input id="client" name="client" placeholder="e.g. Acme Corp" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Draft</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getStatusConfig(status: Invoice['status']) {
  switch (status) {
    case 'paid': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Paid' };
    case 'approved': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShieldCheck, label: 'Approved' };
    case 'pending_approval': return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending Approval' };
    case 'draft': return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: 'Draft' };
    default: return { color: 'bg-gray-100 text-gray-700', icon: FileText, label: status };
  }
}

export default function Invoices() {
  const { invoices, approveInvoice, markInvoicePaid } = useData();
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    approveInvoice(id);
    toast({ title: "Invoice Approved", description: "Transaction has been created (Pending)." });
  };

  const handleMarkPaid = (id: string) => {
    markInvoicePaid(id);
    toast({ title: "Invoice Paid", description: "Transaction completed and invoice marked as paid." });
  };

  return (
    <Layout title="Invoices" description="Manage client billings and approvals.">
      <div className="flex justify-end mb-6">
        <CreateInvoiceDialog />
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Drafts must be approved by a manager. Approved invoices become pending transactions until paid.
            </CardDescription>
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
                  {invoices.map((invoice) => {
                    const status = getStatusConfig(invoice.status);
                    const StatusIcon = status.icon;
                    return (
                        <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <td className="p-4 align-middle font-medium">{invoice.id}</td>
                            <td className="p-4 align-middle">{invoice.client}</td>
                            <td className="p-4 align-middle text-muted-foreground">{invoice.date}</td>
                            <td className="p-4 align-middle text-muted-foreground">{invoice.dueDate}</td>
                            <td className="p-4 align-middle">
                            <Badge variant="outline" className={cn("capitalize gap-1", status.color)}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                            </Badge>
                            </td>
                            <td className="p-4 align-middle text-right font-medium">
                            ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 align-middle text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {(invoice.status === 'draft' || invoice.status === 'pending_approval') && (
                                      <DropdownMenuItem onClick={() => handleApprove(invoice.id)}>
                                        <ShieldCheck className="w-4 h-4 mr-2" /> Approve
                                      </DropdownMenuItem>
                                    )}
                                    {invoice.status === 'approved' && (
                                      <DropdownMenuItem onClick={() => handleMarkPaid(invoice.id)}>
                                        <Wallet className="w-4 h-4 mr-2" /> Mark Paid
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
