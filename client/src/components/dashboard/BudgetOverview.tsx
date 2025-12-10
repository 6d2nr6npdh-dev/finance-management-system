import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface BudgetOverviewProps {
  orgId: string;
}

interface Budget {
  id: string;
  name: string;
  category_name: string | null;
  account_name: string | null;
  amount: number;
  spent: number;
  percent_used: number;
  alert_triggered: boolean;
}

export function BudgetOverview({ orgId }: BudgetOverviewProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const loadBudgets = async () => {
      const { data } = await supabase.rpc("get_organization_budgets", {
        p_organization_id: orgId,
      });

      // Show top 5 budgets
      setBudgets((data || []).slice(0, 5));
    };

    loadBudgets();
  }, [orgId]);

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 100) return "bg-red-500";
    if (percentUsed >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="col-span-full lg:col-span-3 border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Budget Overview</CardTitle>
        <CardDescription>Track your spending against budgets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const percentUsed = Number(budget.percent_used) || 0;
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{budget.name}</span>
                    {budget.alert_triggered && (
                      <AlertTriangle className="w-3 h-3 text-yellow-600" />
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    ${Number(budget.spent).toLocaleString()} / ${Number(budget.amount).toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentUsed, 100)}
                  className="h-2"
                  indicatorClassName={getProgressColor(percentUsed)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{budget.category_name || budget.account_name}</span>
                  <span className={cn(percentUsed >= 100 && "text-red-600 font-medium")}>
                    {percentUsed.toFixed(0)}% used
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No active budgets.  Create budgets to track spending.
          </div>
        )}
      </CardContent>
    </Card>
  );
}