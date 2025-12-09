import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { Wallet, TrendingUp, TrendingDown, FileText } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    supabase. auth.getSession().then(({ data: { session } }) => {
      if (! session) {
        setLocation("/");
      } else {
        setIsLoading(false);
      }
    });
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  return (
    <Layout title="Dashboard" description="Welcome back! Here's what's happening with your finances.">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Balance" 
          value="$146,152.50" 
          trend="+2.3%" 
          trendUp={true} 
          icon={Wallet} 
          color="blue"
        />
        <StatCard 
          title="Monthly Income" 
          value="$58,000" 
          trend="+12.5%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="green"
        />
        <StatCard 
          title="Monthly Expenses" 
          value="$39,234" 
          trend="-5.2%" 
          trendUp={false} 
          icon={TrendingDown} 
          color="orange"
        />
        <StatCard 
          title="Outstanding Invoices" 
          value="$35,500" 
          description="3 pending" 
          icon={FileText} 
          color="purple"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
        <RevenueChart />
        <BudgetOverview />
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
         <div className="col-span-full">
           <RecentTransactions />
         </div>
      </div>
    </Layout>
  );
}
