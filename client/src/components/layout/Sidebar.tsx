import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  FileText, 
  PieChart, 
  BarChart3, 
  Building2, 
  Settings,
  ChevronDown,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockOrganizations } from "@/lib/mockData";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Wallet, label: "Accounts", href: "/accounts" },
  { icon: ArrowRightLeft, label: "Transactions", href: "/transactions" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: PieChart, label: "Budgets", href: "/budgets" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Building2, label: "Organization", href: "/organization" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [activeOrg, setActiveOrg] = useState(mockOrganizations[0]);

  return (
    <aside className={cn("w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col", className)}>
      {/* Logo */}
      <div className="p-6 h-16 flex items-center border-b border-sidebar-border/50 shrink-0">
        <div className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
            <span className="text-lg">$</span>
          </div>
          FinanceApp
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* Org Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between p-2 rounded-md border border-input bg-background hover:bg-accent/50 transition-colors mb-6 shadow-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">{activeOrg.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {mockOrganizations.map(org => (
              <DropdownMenuItem key={org.id} onClick={() => setActiveOrg(org)} className="gap-2">
                 <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                    {org.name.substring(0,1)}
                 </div>
                 {org.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <div className="w-5 h-5 rounded border border-dashed border-foreground/50 flex items-center justify-center">
                +
              </div>
              Create Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate mt-1">Owner</p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
