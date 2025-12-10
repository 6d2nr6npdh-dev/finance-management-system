import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Trash2, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";

const budgetSchema = z.object({
  name: z.string().min(2, "Budget name must be at least 2 characters"),
  budget_type: z.enum(['category', 'account']),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  period: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  alert_threshold: z.number().min(0).max(100).default(80),
  alert_enabled: z.boolean().default(true),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.budget_type === 'category') return !!data.category_id;
    if (data.budget_type === 'account') return !!data.account_id;
    return false;
  },
  {
    message: "Please select a category or account",
    path: ["budget_type"],
  }
);

type BudgetFormData = z.infer<typeof budgetSchema>;

interface Budget {
  id: string;
  name: string;
  category_id:  string | null;
  category_name: string | null;
  account_id: string | null;
  account_name: string | null;
  amount: number;
  spent: number;
  remaining: number;
  percent_used: number;
  period: string;
  start_date: string;
  end_date: string;
  alert_threshold: number;
  alert_enabled: boolean;
  alert_triggered: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  current_balance: number;
}

function AddBudgetDialog({
  orgId,
  categories,
  accounts,
  onBudgetAdded,
}: {
  orgId: string;
  categories:  Category[];
  accounts: Account[];
  onBudgetAdded: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: "monthly",
      alert_threshold:  80,
      alert_enabled: true,
      budget_type: "category",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
    },
  });

  const selectedBudgetType = watch("budget_type");
  const selectedPeriod = watch("period");

  // Auto-calculate end date based on period
  useEffect(() => {
    const startDate = watch("start_date");
    if (startDate && selectedPeriod !== "custom") {
      const start = new Date(startDate);
      let end = new Date(start);

      switch (selectedPeriod) {
        case "monthly":
          end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
          break;
        case "quarterly": 
          end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
          break;
        case "yearly":
          end = new Date(start.getFullYear(), 11, 31);
          break;
      }

      setValue("end_date", end.toISOString().split("T")[0]);
    }
  }, [watch("start_date"), selectedPeriod]);

  const onSubmit = async (values: BudgetFormData) => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase. rpc("create_budget", {
        p_organization_id: orgId,
        p_name: values. name,
        p_category_id: values.budget_type === 'category' ? values.category_id : null,
        p_account_id: values.budget_type === 'account' ? values.account_id : null,
        p_amount: values.amount,
        p_period: values.period,
        p_start_date: values.start_date,
        p_end_date: values.end_date,
        p_alert_threshold: values.alert_threshold,
        p_alert_enabled: values.alert_enabled,
        p_notes: values.notes || null,
      });

      if (error) {
        console.error("Error creating budget:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Budget Created",
        description: `${values.name} has been created successfully.`,
      });

      setOpen(false);
      reset();
      onBudgetAdded();
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
          <Plus className="w-4 h-4" /> Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Set spending limits for categories or accounts
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Budget Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Budget Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Marketing Budget"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Budget Type */}
            <div className="grid gap-2">
              <Label htmlFor="budget_type">Budget Type *</Label>
              <Select
                onValueChange={(value) => setValue("budget_type", value as any)}
                defaultValue="category"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category Budget</SelectItem>
                  <SelectItem value="account">Account Budget</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Track spending by category or limit spending from a specific account
              </p>
            </div>

            {/* Category or Account Selection */}
            {selectedBudgetType === "category" ? (
              <div className="grid gap-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select onValueChange={(value) => setValue("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      . filter((cat) => cat.type === "expense")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="account_id">Account *</Label>
                <Select onValueChange={(value) => setValue("account_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts. map((account) => (
                      <SelectItem key={account. id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount and Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Budget Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors. amount && (
                  <p className="text-red-600 text-sm">{errors.amount.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Select
                  onValueChange={(value) => setValue("period", value as any)}
                  defaultValue="monthly"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input id="start_date" type="date" {...register("start_date")} />
                {errors.start_date && (
                  <p className="text-red-600 text-sm">{errors. start_date.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  {... register("end_date")}
                  disabled={selectedPeriod !== "custom"}
                />
                {errors.end_date && (
                  <p className="text-red-600 text-sm">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {/* Alert Settings */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="alert_threshold">Alert Threshold (%)</Label>
                  <Input
                    id="alert_threshold"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="80"
                    {... register("alert_threshold", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-gray-500">
                    Get notified when spending reaches this percentage
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="alert_enabled"
                    onCheckedChange={(checked) => setValue("alert_enabled", checked)}
                    defaultChecked={true}
                  />
                  <Label htmlFor="alert_enabled">Enable Alerts</Label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about this budget..."
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
              {isSubmitting ? "Creating..." : "Create Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Budgets() {
  const [, params] = useRoute("/org/:orgId/budgets");
  const [, setLocation] = useLocation();
  const orgId = params?.orgId;
  const { toast } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = async () => {
    if (!orgId) return;

    const { data, error } = await supabase. rpc("get_organization_budgets", {
      p_organization_id: orgId,
    });

    if (error) {
      console.error("Error loading budgets:", error);
      return;
    }

    setBudgets(data || []);
  };

  const loadDropdownData = async () => {
    if (!orgId) return;

    // Load categories
    const { data:  categoriesData } = await supabase. rpc("get_org_categories_simple", {
      p_organization_id: orgId,
    });
    setCategories(categoriesData || []);

    // Load accounts
    const { data: accountsData } = await supabase. rpc("get_org_accounts_simple", {
      p_organization_id: orgId,
    });
    setAccounts(accountsData || []);
  };

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (! user) {
        setLocation("/sign-in");
        return;
      }

      if (! orgId) {
        setLocation("/create-organization");
        return;
      }

      await Promise.all([loadBudgets(), loadDropdownData()]);
      setIsLoading(false);
    };

    loadData();
  }, [orgId]);

  const handleDelete = async (id: string) => {
    if (! confirm("Are you sure you want to delete this budget?")) return;

    const { error } = await supabase. rpc("delete_budget", {
      p_budget_id:  id,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Budget Deleted", description: "Budget removed successfully." });
    loadBudgets();
  };

  const handleRecalculate = async (id: string) => {
    const { error } = await supabase.rpc("calculate_budget_spending", {
      p_budget_id: id,
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
      title: "Recalculated",
      description: "Budget spending has been updated.",
    });
    loadBudgets();
  };

  if (isLoading) {
    return (
      <Layout title="Budgets" description="Track and manage spending limits. ">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading budgets...</div>
        </div>
      </Layout>
    );
  }

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 100) return "bg-red-500";
    if (percentUsed >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Layout title="Budgets" description="Track and manage spending limits.">
      <div className="flex justify-end mb-6">
        {orgId && (
          <AddBudgetDialog
            orgId={orgId}
            categories={categories}
            accounts={accounts}
            onBudgetAdded={loadBudgets}
          />
        )}
      </div>

      {budgets.length === 0 ?  (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first budget to track spending
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const percentUsed = Number(budget.percent_used) || 0;
            const isOverBudget = percentUsed >= 100;
            const isNearLimit = percentUsed >= budget.alert_threshold;

            return (
              <Card
                key={budget.id}
                className={cn(
                  "border-border/50 shadow-sm hover:shadow-md transition-all duration-200",
                  budget.alert_triggered && "border-yellow-300 bg-yellow-50/30"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">
                        {budget.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {budget.category_name || budget.account_name} •{" "}
                        {budget. period. charAt(0).toUpperCase() + budget.period.slice(1)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRecalculate(budget.id)}
                        title="Recalculate spending"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Alert Warning */}
                  {budget. alert_triggered && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-200 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-xs text-yellow-800">
                        {isOverBudget ? "Over budget!" : "Approaching limit"}
                      </p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium">
                        ${Number(budget.spent).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{" "}
                        / $
                        {Number(budget. amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentUsed, 100)}
                      className="h-2"
                      indicatorClassName={getProgressColor(percentUsed)}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentUsed.toFixed(1)}% used</span>
                      <span
                        className={cn(
                          "font-medium",
                          Number(budget.remaining) < 0
                            ? "text-red-600"
                            : "text-gray-700"
                        )}
                      >
                        $
                        {Math.abs(Number(budget.remaining)).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {Number(budget.remaining) < 0 ? "over" : "remaining"}
                      </span>
                    </div>
                  </div>

                  {/* Period Info */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    {new Date(budget.start_date).toLocaleDateString()} -{" "}
                    {new Date(budget.end_date).toLocaleDateString()}
                  </div>

                  {/* Notes */}
                  {budget.notes && (
                    <p className="text-xs text-gray-600 italic">{budget.notes}</p>
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