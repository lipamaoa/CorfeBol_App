"use client"

import type { SharedData } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import { Trophy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserMenuContent } from "@/components/user-menu-content"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const { auth } = usePage<SharedData>().props

  // Function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center px-8 gap-2 ">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-black-600" />
            <span className="text-lg font-bold">Korfball Manager</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {auth.user ? (
            <div className="flex items-center gap-4">
              {/* Avatar dropdown using shadcn/ui components */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition-colors">
                    <Avatar className="h-9 w-9">
                      {auth.user.profile_photo_url ? (
                        <AvatarImage src={auth.user.profile_photo_url} alt={auth.user.name} />
                      ) : (
                        <AvatarFallback>{getUserInitials(auth.user.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm font-medium">{auth.user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link
                href={window.route("login")}
                className="text-sm font-medium px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                href={window.route("register")}
                className="text-sm font-medium px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

