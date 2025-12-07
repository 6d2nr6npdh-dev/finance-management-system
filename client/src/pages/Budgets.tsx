import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockBudgets, mockCategories } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
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

function AddBudgetDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Budget Limit</DialogTitle>
          <DialogDescription>
            Create a new spending limit for a specific category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="limit">Monthly Limit</Label>
            <Input id="limit" type="number" placeholder="0.00" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="period">Reset Period</Label>
            <Select defaultValue="monthly">
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="monthly">Monthly</SelectItem>
                 <SelectItem value="quarterly">Quarterly</SelectItem>
                 <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Budget</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Budgets() {
  return (
    <Layout title="Budgets" description="Track your spending limits and goals.">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
           <h2 className="text-2xl font-semibold tracking-tight">Active Budgets</h2>
           <p className="text-sm text-muted-foreground">You have 4 active budgets for this month.</p>
        </div>
        <AddBudgetDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockBudgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const isOverBudget = budget.spent > budget.limit;
          
          return (
            <Card key={budget.id} className={cn("border-border/50 shadow-sm transition-all hover:shadow-md", isOverBudget && "border-red-200 bg-red-50/10")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">{budget.category}</CardTitle>
                    <CardDescription className="text-xs">Reset: {budget.period}</CardDescription>
                  </div>
                  <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", 
                    isOverBudget ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-end justify-between mb-2">
                       <span className="text-2xl font-bold font-heading">${budget.spent.toLocaleString()}</span>
                       <span className="text-sm text-muted-foreground mb-1">of ${budget.limit.toLocaleString()}</span>
                    </div>
                    <Progress value={percentage} className="h-2" indicatorClassName={cn(isOverBudget ? "bg-red-500" : budget.color)} />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
}
