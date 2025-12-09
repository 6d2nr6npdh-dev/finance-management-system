import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight,
  ArrowLeftRight,
  XCircle,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  account_id: z.string().min(1, "Account is required"),
  to_account_id: z.string().optional(),
  category_id: z.string().optional(),
  payee_id: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  reference_number:  z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'cleared', 'reconciled']).default('pending'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Transaction {
  id: string;
  type: string;
  status: string;
  account_id: string;
  account_name: string;
  to_account_id:  string | null;
  to_account_name: string | null;
  category_id: string | null;
  category_name: string | null;
  payee_id: string | null;
  payee_name: string | null;
  amount: number;
  date: string;
  description: string | null;
  reference_number:  string | null;
  notes:  string | null;
  tags:  string[] | null;
  created_at: string;
  created_by_name: string | null;
}

interface Account {
  id: string;
  name: string;
  type: string;
  current_balance: number;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Payee {
  id: string;
  name: string;
}

const statusIcons = {
  pending: Clock,
  cleared: CheckCircle2,
  reconciled: FileCheck,
  void: XCircle,
};

const statusColors = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  cleared: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  reconciled: "bg-blue-50 text-blue-700 ring-blue-600/20",
  void: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

function AddTransactionDialog({ orgId, accounts, categories, payees, onTransactionAdded }: {
  orgId: string;
  accounts: Account[];
  categories: Category[];
  payees: Payee[];
  onTransactionAdded:  () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    }
  });

  const selectedType = watch("type");

  const onSubmit = async (values: TransactionFormData) => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase. rpc('create_transaction', {
        p_organization_id: orgId,
        p_type: values.type,
        p_account_id: values.account_id,
        p_to_account_id: values.to_account_id || null,
        p_category_id: values.category_id || null,
        p_payee_id: values.payee_id || null,
        p_amount: values.amount,
        p_date: values.date,
        p_description: values. description || null,
        p_reference_number: values.reference_number || null,
        p_notes:  values.notes || null,
        p_tags: null,
        p_status: values.status,
      });

      if (error) {
        console.error("Error creating transaction:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Transaction Created",
        description: `Transaction has been added successfully. `,
      });

      setOpen(false);
      reset();
      onTransactionAdded();
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
          <Plus className="w-4 h-4" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>Record a new financial transaction</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Transaction Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select onValueChange={(value) => setValue("type", value as any)} defaultValue="expense">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {... register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-red-600 text-sm">{errors. amount.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-red-600 text-sm">{errors. date.message}</p>
                )}
              </div>
            </div>

            {/* Account Selection */}
            <div className="grid gap-2">
              <Label htmlFor="account_id">{selectedType === 'transfer' ? 'From Account *' : 'Account *'}</Label>
              <Select onValueChange={(value) => setValue("account_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - ${Number(account.current_balance).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account_id && (
                <p className="text-red-600 text-sm">{errors.account_id.message}</p>
              )}
            </div>

            {/* To Account (for transfers) */}
            {selectedType === 'transfer' && (
              <div className="grid gap-2">
                <Label htmlFor="to_account_id">To Account *</Label>
                <Select onValueChange={(value) => setValue("to_account_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account. id} value={account.id}>
                        {account.name} - ${Number(account.current_balance).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category (not for transfers) */}
            {selectedType !== 'transfer' && (
              <div className="grid gap-2">
                <Label htmlFor="category_id">Category</Label>
                <Select onValueChange={(value) => setValue("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      . filter(cat => cat.type === selectedType)
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payee */}
            <div className="grid gap-2">
              <Label htmlFor="payee_id">Payee</Label>
              <Select onValueChange={(value) => setValue("payee_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {payees. map(payee => (
                    <SelectItem key={payee.id} value={payee. id}>
                      {payee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Office supplies"
                {...register("description")}
              />
            </div>

            {/* Reference Number and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reference_number">Reference #</Label>
                <Input
                  id="reference_number"
                  placeholder="Check #, Invoice #, etc."
                  {... register("reference_number")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setValue("status", value as any)} defaultValue="pending">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cleared">Cleared</SelectItem>
                    <SelectItem value="reconciled">Reconciled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information..."
                rows={3}
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// Add this component before the main Transactions component
function AccountBalanceSummary({ accounts }: { accounts: Account[] }) {
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-900">Total Cleared Balance</p>
          <p className="text-xs text-blue-700">Only includes cleared and reconciled transactions</p>
        </div>
        <div className="text-2xl font-bold text-blue-900">
          ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
export default function Transactions() {
  const [, params] = useRoute("/org/:orgId/transactions");
  const [, setLocation] = useLocation();
  const orgId = params?.orgId;
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadTransactions = async () => {
    if (!orgId) return;

    const { data, error } = await supabase. rpc('get_organization_transactions', {
      p_organization_id: orgId,
      p_limit: 100,
      p_offset: 0
    });

    if (error) {
      console.error("Error loading transactions:", error);
      return;
    }

    setTransactions(data || []);
  };

  const loadDropdownData = async () => {
    if (!orgId) return;

    // Load accounts
    const { data:  accountsData } = await supabase.rpc('get_org_accounts_simple', {
      p_organization_id: orgId
    });
    setAccounts(accountsData || []);

    // Load categories
    const { data: categoriesData } = await supabase.rpc('get_org_categories_simple', {
      p_organization_id: orgId
    });
    setCategories(categoriesData || []);

    // Load payees
    const { data: payeesData } = await supabase.rpc('get_org_payees_simple', {
      p_organization_id: orgId
    });
    setPayees(payeesData || []);
  };

  useEffect(() => {
    const loadData = async () => {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLocation("/sign-in");
        return;
      }
  
      if (! orgId) {
        // If no orgId, redirect to create organization or first org
        const { data: memberships } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            organizations (
              id,
              name,
              slug
            )
          `)
          .eq('user_id', user.id)
          .limit(1)
          .single();
  
        if (memberships && memberships.organizations) {
          const org = memberships.organizations as any;
          setLocation(`/org/${org.id}/transactions`);
        } else {
          setLocation("/create-organization");
        }
        return;
      }
  
      await Promise.all([loadTransactions(), loadDropdownData()]);
      setIsLoading(false);
    };
  
    loadData();
  }, [orgId]);

  const handleDelete = async (id: string) => {
    if (! confirm("Are you sure you want to delete this transaction?")) return;

    const { error } = await supabase.rpc('delete_transaction', {
      p_transaction_id: id
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Transaction Deleted", description: "Record removed successfully." });
    loadTransactions();
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "cleared" : "pending";

    const { error } = await supabase.rpc('update_transaction_status', {
      p_transaction_id: id,
      p_status: newStatus
    });

    if (error) {
      toast({
        title: "Error",
        description:  error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `Marked as ${newStatus}`,
      description: `Transaction status updated. `
    });
    loadTransactions();
  };

  const filteredTransactions = transactions.filter(t =>
    t.description?. toLowerCase().includes(searchTerm. toLowerCase()) ||
    t.payee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.account_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout title="Transactions" description="View and manage your financial transactions. ">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading transactions...</div>
        </div>
      </Layout>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return ArrowDownRight;
      case 'expense': return ArrowUpRight;
      case 'transfer': return ArrowLeftRight;
      default:  return ArrowUpRight;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return "bg-emerald-100 text-emerald-600";
      case 'expense':  return "bg-red-100 text-red-600";
      case 'transfer': return "bg-blue-100 text-blue-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Layout title="Transactions" description="View and manage your financial transactions.">
      {accounts.length > 0 && <AccountBalanceSummary accounts={accounts} />}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="p-4 md:p-6 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2. 5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target. value)}
              />
            </div>
            <div className="flex gap-2">
              {orgId && (
                <AddTransactionDialog
                  orgId={orgId}
                  accounts={accounts}
                  categories={categories}
                  payees={payees}
                  onTransactionAdded={loadTransactions}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]: border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Account</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Payee/Description</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Amount</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      {searchTerm ? "No transactions found matching your search." : "No transactions found.  Add your first transaction to get started."}
                    </td>
                  </tr>
                ) : filteredTransactions.map((transaction) => {
                  const TypeIcon = getTypeIcon(transaction. type);
                  const StatusIcon = statusIcons[transaction. status as keyof typeof statusIcons] || Clock;
                  
                  return (
                    <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle">
                        <div className={cn("inline-flex items-center gap-1 p-1. 5 rounded-full", getTypeColor(transaction.type))}>
                          <TypeIcon className="w-3 h-3" />
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{transaction.account_name}</span>
                          {transaction.to_account_name && (
                            <span className="text-xs text-gray-500">→ {transaction.to_account_name}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          {transaction.payee_name && (
                            <span className="font-medium text-sm">{transaction.payee_name}</span>
                          )}
                          {transaction.description && (
                            <span className="text-xs text-gray-600">{transaction.description}</span>
                          )}
                          {transaction.reference_number && (
                            <span className="text-xs text-gray-500">Ref: {transaction.reference_number}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {transaction.category_name && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                            {transaction.category_name}
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium capitalize ring-1 ring-inset",
                          statusColors[transaction.status as keyof typeof statusColors]
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {transaction. status}
                        </span>
                      </td>
                      <td className={cn(
                        "p-4 align-middle text-right font-medium tabular-nums",
                        transaction.type === "income" ? "text-emerald-600" : transaction.type === "expense" ? "text-red-600" : "text-blue-600"
                      )}>
                        {transaction.type === "income" && "+"}
                        {transaction.type === "expense" && "-"}
                        ${Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusToggle(transaction.id, transaction.status)}>
                              {transaction.status === "pending" ?  (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Cleared
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 mr-2" /> Mark Pending
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(transaction.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}