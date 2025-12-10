import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RevenueChartProps {
  orgId: string;
}

interface MonthlySummary {
  month: string;
  month_number: number;
  total_income: number;
  total_expenses: number;
}

export function RevenueChart({ orgId }: RevenueChartProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.rpc("get_monthly_summary", {
        p_organization_id:  orgId,
        p_year: selectedYear,
      });

      setMonthlyData(data || []);
    };

    loadData();
  }, [orgId, selectedYear]);

  const chartData = monthlyData.map((item) => ({
    name: item.month,
    revenue: Number(item.total_income),
    expenses: Number(item.total_expenses),
  }));

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Card className="col-span-full lg:col-span-4 border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Revenue vs Expenses</CardTitle>
          <CardDescription>Compare your income and spending over time</CardDescription>
        </div>
        <Select value={selectedYear. toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px] w-full">
          {chartData.length > 0 ?  (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 30, left:  0, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                  contentStyle={{
                    borderRadius:  "8px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value:  any) => `$${Number(value).toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={32} name="Income" />
                <Bar dataKey="expenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={32} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data for {selectedYear}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
            Income
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
            Expenses
          </div>
        </div>
      </CardContent>
    </Card>
  );
}