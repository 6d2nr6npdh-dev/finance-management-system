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
  organization_name: z.string().min(2, "Organization name is too short").optional(),
});

type FormData = z.infer<typeof schema>;

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);

    // 1) Create auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name },
      },
    });
    if (signUpError) {
      setServerError(signUpError.message);
      return;
    }
    const authUser = signUpData.user;
    if (!authUser) {
      // If email confirmation is enabled, tell the user to check inbox
      setServerError("Check your email to confirm your account.");
      return;
    }

    // 2) Insert user profile row — RLS policy allows inserting own row
    const { error: profileErr } = await supabase
      .from("user_profiles")
      .insert({
        id: authUser.id,
        full_name: values.full_name,
      });
    if (profileErr && profileErr.code !== "23505") {
      setServerError(profileErr.message);
      return;
    }

    // 3) Optionally create a first organization and membership as owner
    if (values.organization_name && values.organization_name.trim().length >= 2) {
      const slug = values.organization_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const { data: orgRows, error: orgErr } = await supabase
        .from("organizations")
        .insert({
          name: values.organization_name,
          slug,
          created_by: authUser.id,
        })
        .select("id")
        .limit(1);
      if (orgErr) {
        setServerError(orgErr.message);
        return;
      }
      const org = orgRows?.[0];
      if (org?.id) {
        const { error: memberErr } = await supabase
          .from("organization_members")
          .insert({
            organization_id: org.id,
            user_id: authUser.id,
            role: "owner", // enum: owner | admin | accountant | viewer
          });
        if (memberErr) {
          setServerError(memberErr.message);
          return;
        }
      }
    }

    // 4) Redirect to home (or dashboard)
    setLocation("/");
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Full name</label>
          <input className="w-full border rounded px-3 py-2" {...register("full_name")} />
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
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Organization name (optional)</label>
          <input className="w-full border rounded px-3 py-2" {...register("organization_name")} placeholder="Acme Inc." />
          {errors.organization_name && <p className="text-red-600 text-sm">{errors.organization_name.message}</p>}
        </div>
        {serverError && <p className="text-red-600">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
        <p className="text-sm mt-2">
          Already have an account? <a href="/sign-in" className="text-blue-600 underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}