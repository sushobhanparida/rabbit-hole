"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"
import { LogOut } from "lucide-react"
import { LoginDialog } from "./login-dialog"
import { motion, AnimatePresence } from "framer-motion"

export function HomeHeader() {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <p className="text-sm text-[#a3a3a3] font-medium tracking-wide uppercase">
          Welcome to
        </p>
        <h1 className="text-2xl font-semibold text-[#1a1a1a] mt-0.5">
          Rabbit Hole
        </h1>
      </div>
      <div className="relative">
        {user ? (
          <button onClick={() => setOpen(!open)} className="outline-none">
            <Avatar className="ring-2 ring-[#f0f0f0] ring-offset-2 cursor-pointer hover:ring-[#d1d1d1] transition-all">
              <AvatarFallback className="text-sm">
                {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <LoginDialog />
        )}
        <AnimatePresence>
          {open && user && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-48 bg-white rounded-[16px] shadow-xl border border-[#f0f0f0] p-1.5"
              >
                <p className="px-3 py-2 text-xs text-[#a3a3a3] font-medium truncate">{user.email}</p>
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#525252] hover:text-[#1a1a1a] hover:bg-[#f8f8f8] rounded-[12px] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
