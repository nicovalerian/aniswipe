"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Session, User } from "@supabase/supabase-js";
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
  user: initialUser,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [username, setUsername] = useState<string | null>(null);

  const clearSession = () => {
    setUser(null);
    setUsername(null);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        router.refresh();
      } else {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);
  
  useEffect(() => {
    async function getUsername() {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("mal_username")
          .eq("id", user.id)
          .single();
        setUsername(data?.mal_username || null);
      } else {
        setUsername(null);
      }
    }
    getUsername();
  }, [user, supabase]);

  return (
    <Context.Provider value={{ session: { user } as Session, username, clearSession }}>
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