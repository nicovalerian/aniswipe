"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useSupabase } from "./session-provider"
import { signOut } from "@/app/auth/actions"
import { useRouter } from "next/navigation"
import { Play, User, LogOut, Home, Heart, Download } from "lucide-react"

export default function Navbar() {
  const { session, username, clearSession } = useSupabase()
  const user = session?.user
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    clearSession()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AniSwipe
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-purple-300 transition-colors">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            {user && (
              <>
                <Link href="/swipe">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:text-purple-300 transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Swipe
                  </Button>
                </Link>
                <Link href="/import-mal">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 hover:text-purple-300 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Import MAL
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-purple-400 transition-colors capitalize"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {username || user.email || "User"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800/95 backdrop-blur-md border-white/20 text-white">
                  <DropdownMenuItem
                    onSelect={handleSignOut}
                    className="cursor-pointer hover:bg-white/10 focus:bg-white/10 text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden pb-4">
            <div className="flex space-x-1">
              <Link href="/swipe">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-purple-300 transition-colors"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Swipe
                </Button>
              </Link>
              <Link href="/import-mal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-purple-300 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import MAL
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
