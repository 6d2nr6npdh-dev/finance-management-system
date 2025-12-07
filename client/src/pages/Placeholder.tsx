import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <Layout title={title} description={`Manage your ${title.toLowerCase()} here.`}>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border border-dashed rounded-lg border-border">
        <div className="p-4 rounded-full bg-accent mb-4">
          <Construction className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Under Construction</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          The {title} page is currently being built. Check back soon for updates.
        </p>
        <Button>Return to Dashboard</Button>
      </div>
    </Layout>
  );
}
