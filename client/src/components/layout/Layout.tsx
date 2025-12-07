import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function Layout({ children, title = "Dashboard", description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex font-sans">
      <div className="hidden md:block h-screen sticky top-0">
         <Sidebar />
      </div>
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header title={title} description={description} />
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/20">
          <div className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4 pb-10">
            {children}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
