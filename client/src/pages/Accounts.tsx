import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockAccounts } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Accounts() {
  return (
    <Layout title="Accounts" description="Manage your bank accounts and credit cards.">
      <div className="flex justify-end mb-6">
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockAccounts.map((account) => (
          <Card key={account.id} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg text-white", account.color)}>
                  <account.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{account.name}</CardTitle>
                  <CardDescription className="text-xs">{account.type} •••• {account.lastFour}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold font-heading mb-1">
                ${Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className={cn(
                "text-xs font-medium",
                account.balance < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {account.balance < 0 ? "Current Balance (Dr)" : "Available Balance"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
