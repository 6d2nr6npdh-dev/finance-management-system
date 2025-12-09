import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  full_name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function SignUp() {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);

    try {
      // Create auth user
      const { data: signUpData, error:  signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { 
            full_name: values. full_name,
          },
        },
      });

      if (signUpError) {
        setServerError(signUpError.message);
        return;
      }

      const authUser = signUpData.user;
      if (!authUser) {
        setServerError("Check your email to confirm your account.");
        return;
      }

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user is part of any organizations
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations (
            id,
            slug
          )
        `)
        .eq('user_id', authUser.id)
        .limit(1)
        .single();

      if (memberError) {
        console.error("Error checking memberships:", memberError);
        // If no memberships found, redirect to create organization
        window.location.href = "/create-organization";
        return;
      }

      // If user is part of an organization, redirect to that org's dashboard
      if (memberships && memberships.organizations) {
        const org = memberships.organizations as unknown as { id: string; slug:  string };
        window.location. href = `/org/${org.id}/dashboard`;
      } else {
        // If user is not part of any organization, redirect to create one
        window.location.href = "/create-organization";
      }
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setServerError("An unexpected error occurred.  Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Create your account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full name</label>
            <input 
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus: ring-2 focus:ring-blue-500" 
              {... register("full_name")} 
            />
            {errors. full_name && (
              <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              type="email" 
              {...register("email")} 
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              type="password" 
              {... register("password")} 
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
          <p className="text-sm text-center mt-4">
            Already have an account? <a href="/sign-in" className="text-blue-600 hover: underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}