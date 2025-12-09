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
import CreateOrganization from "@/pages/CreateOrganization";
import OrganizationSettings from "@/pages/OrganizationSettings";


function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={SignUp} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />

      {/* Protected routes */}
      <Route path="/org/:orgId/dashboard" component={Dashboard} />
<Route path="/org/:orgId/accounts" component={Accounts} />
<Route path="/org/:orgId/transactions" component={Transactions} />
<Route path="/org/:orgId/budgets" component={Budgets} />
<Route path="/org/: orgId/reports" component={Reports} />
<Route path="/org/:orgId/invoices" component={Invoices} />
<Route path="/user/:userId/settings" component={Settings} />
<Route path="/org/: orgId/organization-settings" component={OrganizationSettings} />
      <Route path="/create-organization" component={CreateOrganization} />
      <Route path="/organization">
        <Placeholder title="Organization" />
      </Route>

      {/* 404 */}
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