"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { signOut } from "@/app/auth/actions";
import { useSupabase } from "./session-provider";

export default function LogoutButton() {
  const router = useRouter();
  const { clearSession } = useSupabase();

  const handleSignOut = async () => {
    await signOut();
    clearSession();
    router.push("/");
  };

  return <Button onClick={handleSignOut}>Logout</Button>;
}