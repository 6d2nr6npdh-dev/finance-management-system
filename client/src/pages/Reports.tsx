import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(217, 91%, 60%)", // Blue
  "hsl(142, 71%, 45%)", // Green
  "hsl(38, 92%, 50%)", // Orange
  "hsl(271, 91%, 65%)", // Purple
  "hsl(10, 79%, 54%)", // Red
  "hsl(199, 89%, 48%)", // Cyan
  "hsl(48, 96%, 53%)", // Yellow
  "hsl(328, 86%, 65%)", // Pink
];

interface MonthlySummary {
  month: string;
  month_number: number;
  total_income: number;
  total_expenses: number;
  net_income: number;
  transaction_count: number;
}

interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage:  number;
}

interface CashFlow {
  account_id: string;
  account_name: string;
  opening_balance: number;
  cash_in: number;
  cash_out: number;
  net_change: number;
  closing_balance: number;
}

interface TopPayee {
  payee_id:  string;
  payee_name: string;
  total_amount: number;
  transaction_count: number;
}

export default function Reports() {
  const [, params] = useRoute("/org/:orgId/reports");
  const [, setLocation] = useLocation();
  const orgId = params?. orgId;

  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year">("month");

  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryBreakdown[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryBreakdown[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [topPayees, setTopPayees] = useState<TopPayee[]>([]);

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    const currentYear = selectedYear;

    if (dateRange === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
    } else if (dateRange === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
    } else {
      return {
        start: `${currentYear}-01-01`,
        end: `${currentYear}-12-31`,
      };
    }
  };

  const loadReports = async () => {
    if (!orgId) return;

    const { start, end } = getDateRange();

    // Load monthly summary
    const { data:  monthlyData } = await supabase. rpc("get_monthly_summary", {
      p_organization_id: orgId,
      p_year: selectedYear,
    });
    setMonthlySummary(monthlyData || []);

    // Load expense breakdown
    const { data: expenseData } = await supabase. rpc("get_expense_breakdown", {
      p_organization_id: orgId,
      p_start_date: start,
      p_end_date: end,
    });
    setExpenseBreakdown(expenseData || []);

    // Load income breakdown
    const { data: incomeData } = await supabase.rpc("get_income_breakdown", {
      p_organization_id: orgId,
      p_start_date: start,
      p_end_date:  end,
    });
    setIncomeBreakdown(incomeData || []);

    // Load cash flow
    const { data:  cashFlowData } = await supabase.rpc("get_cash_flow_by_account", {
      p_organization_id: orgId,
      p_start_date: start,
      p_end_date: end,
    });
    setCashFlow(cashFlowData || []);

    // Load top payees
    const { data: payeesData } = await supabase.rpc("get_top_payees", {
      p_organization_id: orgId,
      p_start_date:  start,
      p_end_date: end,
      p_limit: 10,
    });
    setTopPayees(payeesData || []);
  };

  useEffect(() => {
    const loadData = async () => {
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

      await loadReports();
      setIsLoading(false);
    };

    loadData();
  }, [orgId, selectedYear, dateRange]);

  if (isLoading) {
    return (
      <Layout title="Reports & Analytics" description="Financial insights and analysis">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading reports...</div>
        </div>
      </Layout>
    );
  }

  // Calculate totals
  const totalIncome = incomeBreakdown.reduce((sum, item) => sum + Number(item.total_amount), 0);
  const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + Number(item.total_amount), 0);
  const netIncome = totalIncome - totalExpenses;

  // Prepare pie chart data
  const expensePieData = expenseBreakdown.map((item, index) => ({
    name: item. category_name,
    value:  Number(item.total_amount),
    percentage: Number(item.percentage),
    color: COLORS[index % COLORS.length],
  }));

  const incomePieData = incomeBreakdown.map((item, index) => ({
    name: item.category_name,
    value: Number(item.total_amount),
    percentage: Number(item.percentage),
    color: COLORS[index % COLORS.length],
  }));

  // Prepare monthly chart data
  const monthlyChartData = monthlySummary.map((item) => ({
    month: item. month,
    income: Number(item.total_income),
    expenses: Number(item.total_expenses),
    net: Number(item.net_income),
  }));

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Layout title="Reports & Analytics" description="Financial insights and analysis">
      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value:  any) => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={selectedYear. toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Income</CardDescription>
            <CardTitle
              className={cn(
                "text-2xl flex items-center gap-2",
                netIncome >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              <DollarSign className="w-5 h-5" />
              ${Math.abs(netIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Monthly Revenue vs Expenses */}
        <div className="grid gap-6 md:grid-cols-7">
          <Card className="col-span-4 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Monthly comparison for {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                        }}
                        cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                        formatter={(value:  any) => `$${Number(value).toLocaleString()}`}
                      />
                      <Bar dataKey="income" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Income" />
                      <Bar dataKey="expenses" fill="hsl(10, 79%, 54%)" radius={[4, 4, 0, 0]} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available for {selectedYear}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="col-span-3 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>By category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {expensePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ percentage }) => `${percentage.toFixed(0)}%`}
                        labelLine={false}
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius:  "8px",
                          border: "1px solid hsl(var(--border))",
                        }}
                        formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expenses recorded
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {expensePieData.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-muted-foreground truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Breakdown & Cash Flow */}
        <div className="grid gap-6 md: grid-cols-2">
          {/* Income Breakdown */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
              <CardDescription>By category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incomePieData.length > 0 ? (
                  incomePieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No income recorded</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow by Account */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Cash Flow by Account</CardTitle>
              <CardDescription>Account balances and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cashFlow.length > 0 ? (
                  cashFlow.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{account.account_name}</p>
                        <p className="text-xs text-muted-foreground">
                          In: ${Number(account.cash_in).toLocaleString()} | Out: $
                          {Number(account. cash_out).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${Number(account. closing_balance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-medium",
                            Number(account.net_change) >= 0 ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {Number(account.net_change) >= 0 ? "+" : ""}$
                          {Number(account. net_change).toLocaleString(undefined, { minimumFractionDigits:  2 })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No cash flow data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Payees */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Top Payees</CardTitle>
            <CardDescription>Highest spending by vendor/supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPayees.length > 0 ? (
                topPayees. map((payee, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{payee.payee_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {payee.transaction_count} transaction{payee.transaction_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${Number(payee.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No payee data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}