import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/lib/dataContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import Invoices from "@/pages/Invoices";
import Settings from "@/pages/Settings";
import Placeholder from "@/pages/Placeholder";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/budgets" component={Budgets} />
      <Route path="/reports" component={Reports} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/settings" component={Settings} />
      <Route path="/sign-in" component={SignIn} />
<Route path="/sign-up" component={SignUp} />
      
      <Route path="/organization">
        <Placeholder title="Organization" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Router />
          <Toaster />
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

