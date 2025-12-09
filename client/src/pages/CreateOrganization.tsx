import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
  fiscal_year_start: z.number().min(1).max(12).default(1),
});

type FormData = z.infer<typeof schema>;

export default function CreateOrganization() {
  const [, setLocation] = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "USD",
      timezone:  "UTC",
      fiscal_year_start: 1,
    }
  });

  const onSubmit = async (values: FormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setServerError("You must be logged in to create an organization");
        setIsSubmitting(false);
        return;
      }

      // Call database function to create organization
      const { data, error } = await supabase.rpc('create_organization', {
        p_name: values.name,
        p_currency: values.currency,
        p_timezone: values.timezone,
        p_fiscal_year_start: values.fiscal_year_start
      });

      if (error) {
        setServerError(error.message);
        setIsSubmitting(false);
        return;
      }

      // Redirect to the new organization's dashboard
      const orgId = data;
      setLocation(`/org/${orgId}/dashboard`);
      
    } catch (err) {
      console.error("Error creating organization:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create New Organization</h1>
            <p className="text-sm text-gray-600">Set up a new organization to manage finances</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Acme Corporation"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("currency")}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus: ring-blue-500"
              {...register("timezone")}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>

          {/* Fiscal Year Start */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fiscal Year Start Month
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus: ring-2 focus:ring-blue-500"
              {...register("fiscal_year_start", { valueAsNumber: true })}
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the month when your fiscal year begins
            </p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2"
          >
            {isSubmitting ? "Creating..." : "Create Organization"}
          </Button>
        </form>
      </div>
    </div>
  );
}