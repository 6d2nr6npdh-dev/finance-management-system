import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

const schema = z.object({
  full_name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
  organization_name: z.string().optional(), // Make it truly optional
});

type FormData = z.infer<typeof schema>;

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState:  { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);

    try {
      // ONLY create auth user - trigger handles everything else
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { 
            full_name: values.full_name,
            // Don't pass organization_name so users start with empty dashboard
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

      // DON'T INSERT ANYTHING HERE - THE TRIGGER DOES IT
      // Just redirect to dashboard
      setLocation("/");
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setServerError("An unexpected error occurred.  Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Full name</label>
          <input className="w-full border rounded px-3 py-2" {... register("full_name")} />
          {errors.full_name && <p className="text-red-600 text-sm">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" type="email" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input className="w-full border rounded px-3 py-2" type="password" {...register("password")} />
          {errors.password && <p className="text-red-600 text-sm">{errors. password.message}</p>}
        </div>
        {serverError && <p className="text-red-600">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." :  "Sign Up"}
        </button>
        <p className="text-sm mt-2">
          Already have an account?  <a href="/sign-in" className="text-blue-600 underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}