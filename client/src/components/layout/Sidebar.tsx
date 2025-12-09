import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  FileText, 
  PieChart, 
  BarChart3, 
  Settings,
  ChevronDown,
  Briefcase,
  Plus,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Navigation items
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "dashboard" },
  { icon:   Wallet, label: "Accounts", path: "accounts" },
  { icon: ArrowRightLeft, label: "Transactions", path: "transactions" },
  { icon: FileText, label:   "Invoices", path: "invoices" },
  { icon: PieChart, label: "Budgets", path: "budgets" },
  { icon: BarChart3, label: "Reports", path: "reports" },
];

interface SidebarProps {
  className?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract org ID from URL (e.g., /org/123/dashboard -> 123)
  const getOrgIdFromUrl = () => {
    const match = location.match(/^\/org\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // Load user's organizations and user ID
  useEffect(() => {
    const loadOrganizations = async () => {
      const { data: { user } } = await supabase.  auth.getUser();
      
      if (!  user) {
        setIsLoading(false);
        return;
      }

      // Set current user ID for profile settings link
      setCurrentUserId(user.id);

      // Get all organizations the user is a member of
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            slug
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error loading organizations:", error);
        setIsLoading(false);
        return;
      }

      if (memberships && memberships.length > 0) {
        const orgs = memberships
          .map(m => m.organizations)
          .filter(org => org !== null) as unknown as Organization[];
        
        setOrganizations(orgs);

        // Set active org from URL or default to first org
        const urlOrgId = getOrgIdFromUrl();
        const active = orgs.find(o => o.id === urlOrgId) || orgs[0];
        setActiveOrg(active);
      }

      setIsLoading(false);
    };

    loadOrganizations();
  }, [location]);

  // Switch to a different organization
  const switchOrganization = (org: Organization) => {
    setActiveOrg(org);
    setLocation(`/org/${org.id}/dashboard`);
  };

  // Build URL for navigation items based on active org
  const getNavUrl = (path: string) => {
    if (!activeOrg) return `/${path}`;
    return `/org/${activeOrg.id}/${path}`;
  };

  // Check if current location matches a nav item
  const isNavItemActive = (path: string) => {
    if (!activeOrg) return location === `/${path}`;
    return location === `/org/${activeOrg.id}/${path}`;
  };

  if (isLoading) {
    return (
      <aside className={cn("w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col", className)}>
        <div className="p-6">Loading...</div>
      </aside>
    );
  }

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
        {organizations.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-2 rounded-md border border-input bg-background hover:bg-accent/50 transition-colors mb-6 shadow-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0">
                    <Briefcase className="w-3.  5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {activeOrg?.name || "Select Organization"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              {organizations.map(org => (
                <DropdownMenuItem 
                  key={org.id} 
                  onClick={() => switchOrganization(org)} 
                  className={cn(
                    "gap-2",
                    activeOrg?.id === org.id && "bg-accent"
                  )}
                >
                  <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-xs font-semibold">
                    {org.name.  substring(0, 1).toUpperCase()}
                  </div>
                  {org.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/create-organization")} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Navigation */}
        {activeOrg ?   (
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.path);
              const href = getNavUrl(item.  path);
              
              return (
                <Link key={item.path} href={href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            <p className="mb-2">No organizations found</p>
            <button
              onClick={() => setLocation("/create-organization")}
              className="text-primary hover:underline"
            >
              Create your first organization
            </button>
          </div>
        )}
      </div>

      {/* Organization Settings - only show if there's an active org */}
      {activeOrg && (
        <div className="p-4 border-t border-sidebar-border/50 shrink-0">
          <Link href={getNavUrl("organization-settings")}>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover: bg-accent/50 hover: text-accent-foreground transition-all duration-200">
              <Building2 className="w-4 h-4" />
              <span>Organization</span>
            </a>
          </Link>
        </div>
      )}

      {/* User Profile Settings - Always visible, not org-specific */}
      {currentUserId && (
        <div className="p-4 border-t border-sidebar-border/50 shrink-0">
          <Link href={`/user/${currentUserId}/settings`}>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200">
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </a>
          </Link>
        </div>
      )}
    </aside>
  );
}