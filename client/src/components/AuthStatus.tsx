import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!email) {
    return <a className="underline" href="/sign-in">Sign in</a>;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">Signed in as {email}</span>
      <button className="text-sm text-red-600 underline" onClick={() => supabase.auth.signOut()}>
        Sign out
      </button>
    </div>
  );
}