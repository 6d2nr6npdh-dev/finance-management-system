import { LucideIcon, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Building2, ShoppingBag, Landmark, Coffee, Zap } from "lucide-react";

export interface Account {
  id: string;
  name: string;
  type: "Checking" | "Savings" | "Credit Card" | "Investment";
  balance: number;
  lastFour?: string;
  icon: LucideIcon;
  color: string;
}

export interface Transaction {
  id: string;
  payee: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  status: "completed" | "pending";
  icon: LucideIcon;
}

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
}

export const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Business Checking",
    type: "Checking",
    balance: 146152.50,
    lastFour: "4242",
    icon: Building2,
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Corporate Savings",
    type: "Savings",
    balance: 85000.00,
    lastFour: "8899",
    icon: Landmark,
    color: "bg-emerald-500",
  },
  {
    id: "3",
    name: "Amex Business",
    type: "Credit Card",
    balance: -3240.50,
    lastFour: "1001",
    icon: CreditCard,
    color: "bg-purple-500",
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    payee: "Stripe Payments",
    date: "2024-03-10",
    amount: 12500.00,
    type: "income",
    category: "Sales",
    status: "completed",
    icon: ArrowDownRight,
  },
  {
    id: "t2",
    payee: "AWS Web Services",
    date: "2024-03-09",
    amount: 2450.00,
    type: "expense",
    category: "Infrastructure",
    status: "completed",
    icon: Zap,
  },
  {
    id: "t3",
    payee: "WeWork Office Rent",
    date: "2024-03-01",
    amount: 4500.00,
    type: "expense",
    category: "Office",
    status: "completed",
    icon: Building2,
  },
  {
    id: "t4",
    payee: "Client Payment - Acme Corp",
    date: "2024-02-28",
    amount: 8500.00,
    type: "income",
    category: "Services",
    status: "pending",
    icon: ArrowDownRight,
  },
  {
    id: "t5",
    payee: "Starbucks Meeting",
    date: "2024-02-28",
    amount: 45.50,
    type: "expense",
    category: "Meals",
    status: "completed",
    icon: Coffee,
  },
];

export const mockBudgets: Budget[] = [
  { id: "b1", category: "Infrastructure", spent: 2450, limit: 3000, color: "bg-blue-500" },
  { id: "b2", category: "Office", spent: 4500, limit: 5000, color: "bg-purple-500" },
  { id: "b3", category: "Marketing", spent: 1200, limit: 5000, color: "bg-pink-500" },
  { id: "b4", category: "Travel", spent: 850, limit: 2000, color: "bg-orange-500" },
];

export const revenueData = [
  { name: "Jan", revenue: 45000, expenses: 32000 },
  { name: "Feb", revenue: 52000, expenses: 35000 },
  { name: "Mar", revenue: 48000, expenses: 38000 },
  { name: "Apr", revenue: 61000, expenses: 42000 },
  { name: "May", revenue: 58000, expenses: 39000 },
  { name: "Jun", revenue: 65000, expenses: 45000 },
];
