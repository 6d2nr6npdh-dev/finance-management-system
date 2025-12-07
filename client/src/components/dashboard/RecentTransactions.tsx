import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockTransactions } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function RecentTransactions() {
  return (
    <Card className="col-span-full lg:col-span-3 border-border/50 shadow-sm flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          <CardDescription>Latest financial activity</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1 h-8">
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-6">
          {mockTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  transaction.type === "income" 
                    ? "bg-emerald-100/50 text-emerald-600 group-hover:bg-emerald-100" 
                    : "bg-red-100/50 text-red-600 group-hover:bg-red-100"
                )}>
                  <transaction.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{transaction.payee}</p>
                  <p className="text-xs text-muted-foreground mt-1">{transaction.date} • {transaction.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-semibold tabular-nums",
                  transaction.type === "income" ? "text-emerald-600" : "text-foreground"
                )}>
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">
                  {transaction.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
