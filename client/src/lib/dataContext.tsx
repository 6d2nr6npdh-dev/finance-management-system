import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  Building2, Landmark, CreditCard, ArrowDownRight, Zap, Coffee, 
  LucideIcon 
} from "lucide-react";

// --- Types ---
export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Account {
  id: string;
  organizationId: string;
  name: string;
  type: "checking" | "savings" | "credit_card" | "investment";
  balance: number;
  lastFour?: string;
  iconName: "Building2" | "Landmark" | "CreditCard"; // Serializable icon name
  color: string;
}

export interface Transaction {
  id: string;
  organizationId: string;
  payee: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  status: "completed" | "pending";
  invoiceId?: string; // Link to an invoice if generated from one
}

export interface Invoice {
  id: string;
  organizationId: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "draft" | "pending_approval" | "approved" | "paid"; 
}

export interface Budget {
  id: string;
  organizationId: string;
  category: string;
  spent: number;
  limit: number;
  period: "monthly" | "yearly";
  color: string;
}

// --- Initial Data ---
const initialOrgs: Organization[] = [
  { id: "org1", name: "Acme Corporation", slug: "acme-corp" },
  { id: "org2", name: "Globex Inc", slug: "globex-inc" },
];

const initialAccounts: Account[] = [
  // Org 1 Accounts
  { id: "1", organizationId: "org1", name: "Business Checking", type: "checking", balance: 146152.50, lastFour: "4242", iconName: "Building2", color: "bg-blue-500" },
  { id: "2", organizationId: "org1", name: "Corporate Savings", type: "savings", balance: 85000.00, lastFour: "8899", iconName: "Landmark", color: "bg-emerald-500" },
  // Org 2 Accounts
  { id: "3", organizationId: "org2", name: "Globex Operations", type: "checking", balance: 52000.00, lastFour: "1234", iconName: "Building2", color: "bg-indigo-500" },
];

const initialTransactions: Transaction[] = [
  { id: "t1", organizationId: "org1", payee: "Stripe Payments", date: "2024-03-10", amount: 12500.00, type: "income", category: "Sales", status: "completed" },
  { id: "t2", organizationId: "org1", payee: "AWS Web Services", date: "2024-03-09", amount: 2450.00, type: "expense", category: "Infrastructure", status: "completed" },
  { id: "t3", organizationId: "org2", payee: "Globex Payroll", date: "2024-03-01", amount: 45000.00, type: "expense", category: "Salaries", status: "completed" },
];

const initialBudgets: Budget[] = [
  { id: "b1", organizationId: "org1", category: "Infrastructure", spent: 2450, limit: 3000, period: "monthly", color: "bg-blue-500" },
  { id: "b2", organizationId: "org1", category: "Office", spent: 4500, limit: 5000, period: "monthly", color: "bg-purple-500" },
  { id: "b3", organizationId: "org2", category: "Marketing", spent: 8000, limit: 12000, period: "monthly", color: "bg-pink-500" },
];

const initialInvoices: Invoice[] = [
  { id: "INV-001", organizationId: "org1", client: "TechStart Inc", amount: 12500.00, date: "2024-03-01", dueDate: "2024-03-15", status: "paid" },
  { id: "INV-002", organizationId: "org1", client: "MegaCorp", amount: 4500.00, date: "2024-03-10", dueDate: "2024-03-24", status: "pending_approval" },
];

// --- Context ---
interface DataContextType {
  activeOrgId: string;
  setActiveOrgId: (id: string) => void;
  organizations: Organization[];
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  invoices: Invoice[];
  
  // Actions
  addTransaction: (t: Omit<Transaction, "id" | "organizationId">) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;
  
  addAccount: (a: Omit<Account, "id" | "organizationId">) => void;
  
  addBudget: (b: Omit<Budget, "id" | "organizationId">) => void;
  deleteBudget: (id: string) => void;
  
  addInvoice: (i: Omit<Invoice, "id" | "organizationId">) => void;
  approveInvoice: (id: string) => void; // Moves to Approved -> Creates Pending Transaction
  markInvoicePaid: (id: string) => void; // Marks Invoice Paid -> Transaction Completed
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [activeOrgId, setActiveOrgId] = useState("org1");
  const [organizations] = useState(initialOrgs);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [invoices, setInvoices] = useState(initialInvoices);

  // Filters
  const orgAccounts = accounts.filter(a => a.organizationId === activeOrgId);
  const orgTransactions = transactions.filter(t => t.organizationId === activeOrgId);
  const orgBudgets = budgets.filter(b => b.organizationId === activeOrgId);
  const orgInvoices = invoices.filter(i => i.organizationId === activeOrgId);

  // Actions
  const addTransaction = (t: Omit<Transaction, "id" | "organizationId">) => {
    const newTx: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      organizationId: activeOrgId,
    };
    setTransactions(prev => [newTx, ...prev]);
    
    // Update budget spent if expense
    if (t.type === "expense") {
      setBudgets(prev => prev.map(b => 
        b.organizationId === activeOrgId && b.category === t.category
          ? { ...b, spent: b.spent + t.amount }
          : b
      ));
    }
    
    // Update account balance
    // (In a real app, we'd find the account and update it, but for now we just show static balance or update it simply)
    // Let's implement simple balance update
    // We don't have accountId in transaction interface yet, but let's assume it affects "Total Balance" 
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const toggleTransactionStatus = (id: string) => {
    setTransactions(prev => prev.map(t => {
       if (t.id !== id) return t;
       const newStatus = t.status === "pending" ? "completed" : "pending";
       
       // If this transaction is linked to an invoice, update invoice status
       if (t.invoiceId && newStatus === "completed") {
         setInvoices(invs => invs.map(i => i.id === t.invoiceId ? { ...i, status: "paid" } : i));
       }
       
       return { ...t, status: newStatus };
    }));
  };

  const addAccount = (a: Omit<Account, "id" | "organizationId">) => {
    const newAcc: Account = {
      ...a,
      id: Math.random().toString(36).substr(2, 9),
      organizationId: activeOrgId,
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const addBudget = (b: Omit<Budget, "id" | "organizationId">) => {
    const newBudget: Budget = {
      ...b,
      id: Math.random().toString(36).substr(2, 9),
      organizationId: activeOrgId,
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addInvoice = (i: Omit<Invoice, "id" | "organizationId">) => {
     const newInvoice: Invoice = {
       ...i,
       id: `INV-${Math.floor(Math.random() * 1000)}`,
       organizationId: activeOrgId,
       status: "draft" // Default to draft
     };
     setInvoices(prev => [newInvoice, ...prev]);
  };

  const approveInvoice = (id: string) => {
    setInvoices(prev => prev.map(i => {
      if (i.id !== id) return i;
      
      // When approved, create a PENDING income transaction
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        organizationId: activeOrgId,
        payee: i.client,
        date: new Date().toISOString().split('T')[0],
        amount: i.amount,
        type: "income",
        category: "Sales", // Default category for invoices
        status: "pending",
        invoiceId: i.id
      };
      setTransactions(curr => [newTx, ...curr]);

      return { ...i, status: "approved" };
    }));
  };

  const markInvoicePaid = (id: string) => {
     // Check if transaction exists, if so mark completed
     const tx = transactions.find(t => t.invoiceId === id);
     if (tx) {
       toggleTransactionStatus(tx.id);
     } else {
       // Just update invoice if no tx found (fallback)
       setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: "paid" } : i));
     }
  };

  return (
    <DataContext.Provider value={{
      activeOrgId,
      setActiveOrgId,
      organizations,
      accounts: orgAccounts,
      transactions: orgTransactions,
      budgets: orgBudgets,
      invoices: orgInvoices,
      addTransaction,
      deleteTransaction,
      toggleTransactionStatus,
      addAccount,
      addBudget,
      deleteBudget,
      addInvoice,
      approveInvoice,
      markInvoicePaid
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
