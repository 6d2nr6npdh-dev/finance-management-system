import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { NewTransactionDialog } from "@/components/transactions/NewTransactionDialog";

export function Header({ title, description }: { title: string; description?: string }) {
  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between gap-4">
      
      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar className="flex border-none" />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-heading font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground hidden md:block">{description}</p>}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search transactions..." 
            className="pl-9 h-9 bg-background/50 border-input/50 focus:bg-background transition-all"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </Button>

        <NewTransactionDialog />
      </div>
    </header>
  );
}
