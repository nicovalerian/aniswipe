"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSupabase } from "./session-provider";
import { signOut } from "@/app/auth/actions";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { session, username, clearSession } = useSupabase();
  const user = session?.user;
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    clearSession();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex space-x-4">
        <Link href="/">
          <Button variant="link" className="text-white">
            Home
          </Button>
        </Link>
        <Link href="/swipe">
          <Button variant="link" className="text-white">
            Swipe
          </Button>
        </Link>
        <Link href="/import-mal">
          <Button variant="link" className="text-white btn-hover-effect">
            Import MAL
          </Button>
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
              <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}