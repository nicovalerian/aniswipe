"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User } from "@supabase/supabase-js"; // Import User type

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null); // Use User type
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async (userId: string) => {
      const { data, error } = await supabase
        .from("User")
        .select("username")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching username:", error);
        setUsername(null);
      } else if (data) {
        setUsername(data.username);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUsername(session.user.id);
        } else {
          setUsername(null);
        }
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsername(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex space-x-4">
        <Link href="/">
          <Button variant="link" className="text-white">Home</Button>
        </Link>
        <Link href="/swipe">
          <Button variant="link" className="text-white">Swipe</Button>
        </Link>
        <Link href="/import-mal">
          <Button variant="link" className="text-white btn-hover-effect">Import MAL</Button>
        </Link>
      </div>
      <div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="capitalize btn-hover-effect">
                {username || user.email || "User"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="cta" className="btn-hover-effect">Auth</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}