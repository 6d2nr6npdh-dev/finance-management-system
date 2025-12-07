import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTransactions } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Transactions() {
  return (
    <Layout title="Transactions" description="View and manage your financial transactions.">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="p-4 md:p-6 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2">
               <Select defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Payee</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {mockTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">{transaction.date}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded-full",
                          transaction.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                        )}>
                          <transaction.icon className="w-3 h-3" />
                        </div>
                        <span className="font-medium">{transaction.payee}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize",
                        transaction.status === "completed" ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                      )}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className={cn(
                      "p-4 align-middle text-right font-medium",
                      transaction.type === "income" ? "text-emerald-600" : "text-foreground"
                    )}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
