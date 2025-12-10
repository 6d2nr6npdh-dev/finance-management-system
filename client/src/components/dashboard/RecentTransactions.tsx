import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  status: string;
  account_name: string;
  category_name: string | null;
  payee_name: string | null;
  amount: number;
  date: string;
  description:  string | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return ArrowDownRight;
      case "expense": 
        return ArrowUpRight;
      case "transfer":
        return ArrowLeftRight;
      default:
        return ArrowUpRight;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-emerald-100 text-emerald-600";
      case "expense":
        return "bg-red-100 text-red-600";
      case "transfer":
        return "bg-blue-100 text-blue-600";
      default: 
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const TypeIcon = getTypeIcon(transaction. type);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover: bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", getTypeColor(transaction.type))}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.payee_name || transaction.description || "Transaction"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category_name || transaction.account_name} •{" "}
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-medium text-sm",
                        transaction. type === "income" ?  "text-green-600" :  transaction.type === "expense" ? "text-red-600" : "text-blue-600"
                      )}
                    >
                      {transaction.type === "income" && "+"}
                      {transaction. type === "expense" && "-"}
                      ${Number(transaction.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recent transactions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}