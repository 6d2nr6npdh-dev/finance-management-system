import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockBudgets } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function BudgetOverview() {
  return (
    <Card className="col-span-full lg:col-span-3 border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Budget Overview</CardTitle>
        <CardDescription>Monthly spending limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mockBudgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">{budget.category}</div>
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">${budget.spent.toLocaleString()}</span> 
                    <span className="text-xs"> / ${budget.limit.toLocaleString()}</span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" indicatorClassName={cn(budget.color)} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
