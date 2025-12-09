import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function SignIn() {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState:  { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);

    const { data, error } = await supabase. auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setServerError("No user returned.");
      return;
    }

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
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError) {
      console.error("Error checking memberships:", memberError);
      // If no memberships found, redirect to create organization
      window. location.href = "/create-organization";
      return;
    }

    // If user is part of an organization, redirect to that org's dashboard
    if (memberships && memberships.organizations) {
      const org = memberships.organizations as unknown as { id: string; slug: string };
      window.location.href = `/org/${org.id}/dashboard`;
    } else {
      // If user is not part of any organization, redirect to create one
      window.location.href = "/create-organization";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Sign in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-sm text-center mt-4">
            New here? <a href="/sign-up" className="text-blue-600 hover:underline">Create an account</a>
          </p>
        </form>
      </div>
    </div>
  );
}