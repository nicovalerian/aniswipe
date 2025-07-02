import Image from "next/image"
import animeImage from "./kokou no hito.jpg";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Star, Users } from "lucide-react"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col text-white font-sans overflow-hidden">
      <Image
        src={animeImage}
        alt="Anime landscape background"
        fill
        className="object-cover"
        style={{ zIndex: -2 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-blue-900/80"
        style={{ zIndex: -1 }}
      />

      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 text-center py-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Swipe right
              </span>
              <br />
              <span className="text-white">on your next favorite anime</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200 leading-relaxed mb-12">
            Discover new anime through personalized recommendations. Build your perfect watchlist, explore new genres,
            and connect with shows that match your taste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3 text-lg"
              >
                Start Swiping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Smart Recommendations</h3>
              <p className="text-gray-300">AI-powered suggestions based on your preferences and viewing history.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Easy Discovery</h3>
              <p className="text-gray-300">Swipe through anime like never before. Simple, fun, and addictive.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Build Your List</h3>
              <p className="text-gray-300">Create and manage your perfect anime watchlist with ease.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 px-4 border-t border-white/10">
        <p className="text-gray-400">© 2025 AniSwipe. Discover your next anime adventure.</p>
      </footer>
    </div>
  )
}
