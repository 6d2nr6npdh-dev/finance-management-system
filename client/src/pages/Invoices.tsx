import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreVertical,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  DollarSign,
  AlertCircle,
  XCircle,
  Trash2,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const invoiceSchema = z.object({
  payee_id: z.string().min(1, "Client/Customer is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  tax_rate: z.number().min(0).max(100).default(0),
  discount_amount: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Invoice {
  id: string;
  invoice_number: string;
  payee_id: string;
  payee_name: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  created_at:  string;
  created_by_name: string | null;
}

interface Payee {
  id: string;
  name: string;
}

const statusIcons = {
  draft: FileText,
  sent: Send,
  viewed: Eye,
  partial: DollarSign,
  paid: CheckCircle2,
  overdue: AlertCircle,
  cancelled: XCircle,
};

const statusColors = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  viewed: "bg-purple-100 text-purple-700 border-purple-200",
  partial: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};
// Add Payee Dialog Component
function AddPayeeDialog({
  orgId,
  onPayeeAdded,
}:  {
  orgId: string;
  onPayeeAdded:  () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_id: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const { data, error } = await supabase. rpc('create_payee', {
        p_organization_id: orgId,
        p_name: formData.name,
        p_email: formData.email || null,
        p_phone:  formData.phone || null,
        p_address: formData. address || null,
        p_tax_id: formData.tax_id || null,
        p_notes: formData.notes || null,
      });
  
      if (error) {
        console.error("Error creating payee:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
  
      toast({
        title: "Payee Added",
        description: `${formData.name} has been added successfully. `,
      });
  
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        phone:  "",
        address: "",
        tax_id: "",
        notes: "",
      });
      onPayeeAdded();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Payee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Payee</DialogTitle>
          <DialogDescription>
            Add a client, vendor, or contractor to your organization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="payee_name">Name *</Label>
              <Input
                id="payee_name"
                placeholder="e.g., Acme Corporation"
                value={formData. name}
                onChange={(e) => setFormData({ ...formData, name: e. target.value })}
                required
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="payee_email">Email</Label>
                <Input
                  id="payee_email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payee_phone">Phone</Label>
                <Input
                  id="payee_phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="payee_address">Address</Label>
              <Textarea
                id="payee_address"
                placeholder="Street address, City, State, ZIP"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ... formData, address: e.target.value })}
              />
            </div>

            {/* Tax ID */}
            <div className="grid gap-2">
              <Label htmlFor="payee_tax_id">Tax ID / EIN</Label>
              <Input
                id="payee_tax_id"
                placeholder="e.g., 12-3456789"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Optional - for tax reporting purposes
              </p>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="payee_notes">Notes</Label>
              <Textarea
                id="payee_notes"
                placeholder="Additional information about this payee..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ... formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Payee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function CreateInvoiceDialog({
  orgId,
  payees,
  onInvoiceCreated,
}:  {
  orgId: string;
  payees: Payee[];
  onInvoiceCreated: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      tax_rate: 0,
      discount_amount:  0,
      currency: "USD",
    },
  });

  const onSubmit = async (values: InvoiceFormData) => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase. rpc("create_invoice", {
        p_organization_id: orgId,
        p_payee_id: values.payee_id,
        p_issue_date:  values.issue_date,
        p_due_date: values. due_date,
        p_tax_rate: values.tax_rate,
        p_discount_amount: values.discount_amount,
        p_currency: values. currency,
        p_notes:  values.notes || null,
        p_terms: values.terms || null,
      });

      if (error) {
        console.error("Error creating invoice:", error);
        toast({
          title: "Error",
          description:  error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Invoice Created",
        description: "Invoice draft has been created successfully.",
      });

      setOpen(false);
      reset();
      onInvoiceCreated();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice draft.  You can add line items after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Client/Customer */}
            <div className="grid gap-2">
              <Label htmlFor="payee_id">Client/Customer *</Label>
              <Select onValueChange={(value) => setValue("payee_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {payees.map((payee) => (
                    <SelectItem key={payee. id} value={payee.id}>
                      {payee. name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payee_id && (
                <p className="text-red-600 text-sm">{errors. payee_id.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input id="issue_date" type="date" {... register("issue_date")} />
                {errors.issue_date && (
                  <p className="text-red-600 text-sm">{errors.issue_date.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input id="due_date" type="date" {...register("due_date")} />
                {errors.due_date && (
                  <p className="text-red-600 text-sm">{errors. due_date.message}</p>
                )}
              </div>
            </div>

            {/* Tax and Discount */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  {...register("tax_rate", { valueAsNumber: true })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discount_amount">Discount Amount</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("discount_amount", { valueAsNumber: true })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  onValueChange={(value) => setValue("currency", value)}
                  defaultValue="USD"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Terms */}
            <div className="grid gap-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <Textarea
                id="terms"
                placeholder="e.g., Net 30, Payment due upon receipt..."
                rows={2}
                {...register("terms")}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for the client..."
                rows={3}
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Invoices() {
  const [, params] = useRoute("/org/:orgId/invoices");
  const [, setLocation] = useLocation();
  const orgId = params?. orgId;
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoices = async () => {
    if (!orgId) return;

    const { data, error } = await supabase. rpc("get_organization_invoices", {
      p_organization_id: orgId,
    });

    if (error) {
      console.error("Error loading invoices:", error);
      return;
    }

    setInvoices(data || []);
  };

  const loadPayees = async () => {
    if (!orgId) return;

    const { data } = await supabase.rpc("get_org_payees_simple", {
      p_organization_id:  orgId,
    });

    setPayees(data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      const { data:  { user } } = await supabase. auth.getUser();

      if (! user) {
        setLocation("/sign-in");
        return;
      }

      if (! orgId) {
        setLocation("/create-organization");
        return;
      }

      await Promise.all([loadInvoices(), loadPayees()]);
      setIsLoading(false);
    };

    loadData();
  }, [orgId]);

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase. rpc("update_invoice_status", {
      p_invoice_id: id,
      p_status: status,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invoice Updated",
      description: `Invoice marked as ${status}`,
    });
    loadInvoices();
  };

  const handleDelete = async (id: string) => {
    if (! confirm("Are you sure you want to delete this invoice?")) return;

    const { error } = await supabase.rpc("delete_invoice", {
      p_invoice_id:  id,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Invoice Deleted", description: "Invoice removed successfully." });
    loadInvoices();
  };

  if (isLoading) {
    return (
      <Layout title="Invoices" description="Manage client billings and invoices. ">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading invoices...</div>
        </div>
      </Layout>
    );
  }

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "paid" && inv.status !== "cancelled")
    .reduce((sum, inv) => sum + Number(inv.amount_due), 0);

  const totalPaid = invoices
    . filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  return (
    <Layout title="Invoices" description="Manage client billings and invoices.">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Outstanding</CardDescription>
            <CardTitle className="text-2xl">
              ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">
              ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-2xl">{invoices.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex justify-end gap-2 mb-6">
  {orgId && (
    <>
      <AddPayeeDialog orgId={orgId} onPayeeAdded={loadPayees} />
      <CreateInvoiceDialog
        orgId={orgId}
        payees={payees}
        onInvoiceCreated={loadInvoices}
      />
    </>
  )}
</div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Manage your client invoices and track payments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Invoice #
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Issue Date
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Due Date
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                    Amount
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                    Amount Due
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No invoices found.  Create your first invoice to get started. 
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const StatusIcon =
                      statusIcons[invoice.status as keyof typeof statusIcons] ||
                      FileText;
                    const statusColor =
                      statusColors[invoice.status as keyof typeof statusColors];

                    // Check if overdue
                    const isOverdue =
                      new Date(invoice.due_date) < new Date() &&
                      invoice.status !== "paid" &&
                      invoice.status !== "cancelled";

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b transition-colors hover: bg-muted/50"
                      >
                        <td className="p-4 align-middle font-medium font-mono text-sm">
                          {invoice.invoice_number}
                        </td>
                        <td className="p-4 align-middle">{invoice.payee_name}</td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "text-sm",
                                isOverdue && "text-red-600 font-medium"
                              )}
                            >
                              {new Date(invoice.due_date).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className="text-xs text-red-500">Overdue</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant="outline"
                            className={cn("capitalize gap-1", statusColor)}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {invoice.status. replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right font-medium tabular-nums">
                          {invoice.currency}{" "}
                          {Number(invoice.total).toLocaleString(undefined, {
                            minimumFractionDigits:  2,
                          })}
                        </td>
                        <td className="p-4 align-middle text-right font-medium tabular-nums">
                          {invoice.currency}{" "}
                          {Number(invoice.amount_due).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {invoice.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(invoice.id, "sent")}
                                >
                                  <Send className="w-4 h-4 mr-2" /> Mark as Sent
                                </DropdownMenuItem>
                              )}
                              {(invoice.status === "sent" ||
                                invoice.status === "viewed" ||
                                invoice.status === "partial") && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(invoice.id, "paid")}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Paid
                                </DropdownMenuItem>
                              )}
                              {invoice.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(invoice.id, "cancelled")
                                  }
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Cancel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(invoice. id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}