import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);

    // 1) Auth
    const { data, error } = await supabase.auth.signInWithPassword({
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

    // 2) Read profile (RLS ensures user only sees their own row)
    const { data: profile, error: profileErr } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profileErr) {
      setServerError(profileErr.message);
      return;
    }
    setFullName(profile?.full_name ?? null);

    // 3) Redirect (later you can redirect based on memberships/orgs)
    setLocation("/");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLocation("/");
    });
  }, [setLocation]);

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" type="email" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input className="w-full border rounded px-3 py-2" type="password" {...register("password")} />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-red-600">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-sm mt-2">
          New here? <a href="/sign-up" className="text-blue-600 underline">Create an account</a>
        </p>
        {fullName && <p className="text-sm mt-3">Welcome back, {fullName}</p>}
      </form>
    </div>
  );
}