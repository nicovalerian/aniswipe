"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";

type SupabaseContext = {
  session: Session | null;
  username: string | null;
  clearSession: () => void;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SessionProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [username, setUsername] = useState<string | null>(null);

  const clearSession = () => {
    setSession(null);
    setUsername(null);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_IN" && newSession) {
        router.refresh();
      }
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);
  
  useEffect(() => {
    async function getUsername() {
      if (session?.user) {
        const { data } = await supabase
          .from("User")
          .select("username")
          .eq("id", session.user.id)
          .single();
        setUsername(data?.username || null);
      } else {
        setUsername(null);
      }
    }
    getUsername();
  }, [session, supabase]);

  return (
    <Context.Provider value={{ session, username, clearSession }}>
      <Toaster />
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return context;
};