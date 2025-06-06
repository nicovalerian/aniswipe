"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import LogoutButton from "./logout-button";
import { useSupabase } from "./session-provider";

export default function Navbar() {
  const { session, username } = useSupabase();
  const user = session?.user;

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
              <DropdownMenuItem>
                <LogoutButton />
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