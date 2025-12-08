import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Building2, Landmark, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/dataContext";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const iconMap = {
  Building2: Building2,
  Landmark: Landmark,
  CreditCard: CreditCard
};

function AddAccountDialog() {
  const { addAccount } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    addAccount({
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      balance: parseFloat(formData.get("balance") as string),
      lastFour: formData.get("lastFour") as string,
      color: "bg-blue-500", // Default color for now
      iconName: "Building2" // Default icon
    });

    setOpen(false);
    toast({ title: "Account Added", description: "Your new account has been created." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>Enter the details for your new bank account or card.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Account Name</Label>
              <Input id="name" name="name" placeholder="e.g. Business Checking" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" required defaultValue="checking">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input id="balance" name="balance" type="number" step="0.01" placeholder="0.00" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastFour">Last 4 Digits (Optional)</Label>
              <Input id="lastFour" name="lastFour" placeholder="1234" maxLength={4} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Accounts() {
  const { accounts } = useData();

  return (
    <Layout title="Accounts" description="Manage your bank accounts and credit cards.">
      <div className="flex justify-end mb-6">
        <AddAccountDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = iconMap[account.iconName] || Wallet;
          return (
            <Card key={account.id} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg text-white", account.color)}>
                    <Icon className="w-5 h-5" />
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
          );
        })}
      </div>
    </Layout>
  );
}
