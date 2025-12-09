import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Building2, Landmark, CreditCard, Wallet, Briefcase, PiggyBank, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Icon mapping for account types
const iconMap = {
  checking: Building2,
  savings: PiggyBank,
  credit_card: CreditCard,
  cash: Wallet,
  investment:  TrendingUp,
  loan: Landmark,
  other:  Briefcase,
};

// Color options for accounts
const colorOptions = [
  { value:  "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-orange-500", label: "Orange" },
  { value:  "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
];

const accountSchema = z.object({
  name: z.string().min(2, "Account name must be at least 2 characters"),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other']),
  currency: z.string().default("USD"),
  initial_balance: z.number().default(0),
  account_number: z.string().optional(),
  institution: z.string().optional(),
  color: z.string().default("bg-blue-500"),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  account_number:  string | null;
  institution: string | null;
  color: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function AddAccountDialog({ orgId, onAccountAdded }: { orgId:  string; onAccountAdded: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      currency: "USD",
      initial_balance: 0,
      color: "bg-blue-500",
    }
  });

  const selectedType = watch("type");
  const selectedColor = watch("color");

  const onSubmit = async (values: AccountFormData) => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase. rpc('create_account', {
        p_organization_id: orgId,
        p_name: values. name,
        p_type:  values.type,
        p_currency: values.currency,
        p_initial_balance: values.initial_balance,
        p_account_number: values.account_number || null,
        p_institution: values.institution || null,
        p_color: values.color,
        p_notes: values.notes || null,
      });

      if (error) {
        console.error("Error creating account:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Created",
        description: `${values.name} has been added successfully. `,
      });

      setOpen(false);
      reset();
      onAccountAdded();
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
          <Plus className="w-4 h-4" /> Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>Create a new financial account for your organization. </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Account Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Business Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors. name.message}</p>
              )}
            </div>

            {/* Type and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Account Type *</Label>
                <Select onValueChange={(value) => setValue("type", value as any)} defaultValue="checking">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="investment">Investment Account</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select onValueChange={(value) => setValue("currency", value)} defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Initial Balance */}
            <div className="grid gap-2">
              <Label htmlFor="initial_balance">Initial Balance</Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("initial_balance", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">The starting balance for this account</p>
            </div>

            {/* Institution and Account Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="institution">Financial Institution</Label>
                <Input
                  id="institution"
                  placeholder="e.g., Chase Bank"
                  {...register("institution")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="account_number">Account Number (Last 4)</Label>
                <Input
                  id="account_number"
                  placeholder="****"
                  maxLength={4}
                  {...register("account_number")}
                />
                <p className="text-xs text-gray-500">Optional, for reference only</p>
              </div>
            </div>

            {/* Color Picker */}
            <div className="grid gap-2">
              <Label>Account Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption. value}
                    type="button"
                    onClick={() => setValue("color", colorOption.value)}
                    className={cn(
                      "w-10 h-10 rounded-md border-2 transition-all",
                      colorOption.value,
                      selectedColor === colorOption.value ?  "border-gray-900 scale-110" : "border-gray-300"
                    )}
                    title={colorOption.label}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about this account..."
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
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Accounts() {
  const [, params] = useRoute("/org/:orgId/accounts");
  const [, setLocation] = useLocation();
  const orgId = params?. orgId;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = async () => {
    if (! orgId) return;

    console.log("Loading accounts for org:", orgId);

    const { data, error } = await supabase. rpc('get_organization_accounts', {
      p_organization_id: orgId
    });

    console.log("Accounts data:", data);
    console.log("Accounts error:", error);

    if (error) {
      console.error("Error loading accounts:", error);
      setIsLoading(false);
      return;
    }

    setAccounts(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (! orgId) {
      setLocation("/");
      return;
    }

    loadAccounts();
  }, [orgId]);

  if (isLoading) {
    return (
      <Layout title="Accounts" description="Manage your bank accounts and credit cards.">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading accounts...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Accounts" description="Manage your bank accounts and credit cards.">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {accounts.length} account{accounts.length !== 1 ?  's' : ''} • Total Balance: ${accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        {orgId && <AddAccountDialog orgId={orgId} onAccountAdded={loadAccounts} />}
      </div>

      {accounts.length === 0 ?  (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first account</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = iconMap[account.type as keyof typeof iconMap] || Wallet;
            return (
              <Card key={account. id} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg text-white", account.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{account.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {account.type. replace('_', ' ')}
                        {account.account_number && ` •••• ${account.account_number}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold font-heading mb-1">
                    {account.currency} {Math.abs(Number(account.current_balance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className={cn(
                    "text-xs font-medium",
                    Number(account.current_balance) < 0 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {Number(account.current_balance) < 0 ? "Overdrawn" : "Available Balance"}
                  </p>
                  {account.institution && (
                    <p className="text-xs text-gray-500 mt-2">{account.institution}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}