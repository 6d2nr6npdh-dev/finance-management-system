import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  color?: string; // Tailwind color class like "text-blue-500" or "bg-blue-500"
  description?: string;
}

export function StatCard({ title, value, trend, trendUp, icon: Icon, color = "blue", description }: StatCardProps) {
  const isPositive = trendUp === true;
  const isNegative = trendUp === false;
  
  // Map color names to actual Tailwind classes dynamically or via a safe map
  const colorMap: Record<string, { bg: string, text: string }> = {
    blue: { bg: "bg-blue-500", text: "text-blue-500" },
    green: { bg: "bg-emerald-500", text: "text-emerald-500" },
    orange: { bg: "bg-orange-500", text: "text-orange-500" },
    purple: { bg: "bg-purple-500", text: "text-purple-500" },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <Card className="overflow-hidden border-border/50 shadow-xs hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-xl mb-4", theme.bg)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              isPositive ? "text-emerald-600 bg-emerald-50" : "",
              isNegative ? "text-red-600 bg-red-50" : ""
            )}>
              {trend}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="text-2xl font-bold font-heading tracking-tight">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
