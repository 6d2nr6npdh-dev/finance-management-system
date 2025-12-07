import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, PieChart, Pie, Cell } from "recharts";
import { revenueData } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for other charts
const expensesByCategory = [
  { name: 'Office', value: 4500, color: 'hsl(var(--chart-1))' },
  { name: 'Infra', value: 2450, color: 'hsl(var(--chart-2))' },
  { name: 'Marketing', value: 1200, color: 'hsl(var(--chart-3))' },
  { name: 'Travel', value: 850, color: 'hsl(var(--chart-4))' },
  { name: 'Meals', value: 450, color: 'hsl(var(--chart-5))' },
];

const accountBalanceHistory = [
  { name: 'Jan', checking: 120000, savings: 80000 },
  { name: 'Feb', checking: 135000, savings: 82000 },
  { name: 'Mar', checking: 146000, savings: 85000 },
  { name: 'Apr', checking: 140000, savings: 85000 },
  { name: 'May', checking: 155000, savings: 88000 },
  { name: 'Jun', checking: 146152, savings: 85000 },
];

export default function Reports() {
  return (
    <Layout title="Reports & Analytics" description="Deep dive into your financial performance.">
      <div className="flex justify-end mb-6">
         <div className="flex gap-2">
            <Select defaultValue="2024">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
         </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-background border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Revenue Chart */}
            <Card className="col-span-4 border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `$${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown Pie Chart */}
            <Card className="col-span-3 border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {expensesByCategory.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Growth */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Account Growth</CardTitle>
              <CardDescription>Balance history over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accountBalanceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="checking" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="savings" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
           <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
             <p className="text-muted-foreground">Detailed expense reports coming soon.</p>
           </div>
        </TabsContent>
        <TabsContent value="cashflow">
           <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
             <p className="text-muted-foreground">Detailed cash flow analysis coming soon.</p>
           </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
