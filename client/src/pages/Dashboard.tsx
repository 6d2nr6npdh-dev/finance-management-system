import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { Wallet, TrendingUp, TrendingDown, FileText } from "lucide-react";

interface DashboardStats {
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  outstanding_invoices:  number;
  pending_invoice_count: number;
  income_trend: number;
  expense_trend: number;
}

interface RecentTransaction {
  id: string;
  type: string;
  status: string;
  account_name: string;
  category_name: string | null;
  payee_name: string | null;
  amount: number;
  date: string;
  description: string | null;
}

export default function Dashboard() {
  const [, params] = useRoute("/org/:orgId/dashboard");
  const [, setLocation] = useLocation();
  const orgId = params?. orgId;

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (! user) {
        setLocation("/sign-in");
        return;
      }

      if (! orgId) {
        setLocation("/create-organization");
        return;
      }

      // Load dashboard stats
      const { data: statsData, error:  statsError } = await supabase. rpc("get_dashboard_stats", {
        p_organization_id: orgId,
      });

      if (statsError) {
        console.error("Error loading dashboard stats:", statsError);
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Load recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase. rpc(
        "get_recent_transactions_dashboard",
        {
          p_organization_id: orgId,
          p_limit: 10,
        }
      );

      if (transactionsError) {
        console.error("Error loading transactions:", transactionsError);
      } else {
        setRecentTransactions(transactionsData || []);
      }

      setIsLoading(false);
    };

    loadDashboard();
  }, [orgId, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Layout title="Dashboard" description="Welcome back!  Here's what's happening with your finances. ">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={`$${Number(stats?.total_balance || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          trend={stats?.income_trend ?  `${stats.income_trend > 0 ? '+' : ''}${stats.income_trend}%` : undefined}
          trendUp={stats ?  stats.income_trend >= 0 : true}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Monthly Income"
          value={`$${Number(stats?.monthly_income || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          trend={stats?.income_trend ? `${stats.income_trend > 0 ? '+' : ''}${stats.income_trend}%` : undefined}
          trendUp={stats ? stats.income_trend >= 0 : true}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${Number(stats?.monthly_expenses || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          trend={stats?.expense_trend ? `${stats.expense_trend > 0 ?  '+' : ''}${stats. expense_trend}%` : undefined}
          trendUp={stats ? stats.expense_trend < 0 : false}
          icon={TrendingDown}
          color="orange"
        />
        <StatCard
          title="Outstanding Invoices"
          value={`$${Number(stats?.outstanding_invoices || 0).toLocaleString(undefined, {
            minimumFractionDigits:  2,
          })}`}
          description={`${stats?.pending_invoice_count || 0} pending`}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
        {orgId && <RevenueChart orgId={orgId} />}
        {orgId && <BudgetOverview orgId={orgId} />}
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
        <div className="col-span-full">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </Layout>
  );
}