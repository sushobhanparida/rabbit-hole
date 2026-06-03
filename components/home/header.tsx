"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"
import { LogOut, User } from "lucide-react"
import { LoginDialog } from "./login-dialog"
import { motion, AnimatePresence } from "framer-motion"

export function HomeHeader() {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/20 shadow-[0_20px_20px_rgba(13,13,13,0.04)] h-16 flex items-center justify-between px-5 max-w-[600px] mx-auto">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-white/80">
          <AvatarFallback className="bg-primary-container/50 text-primary text-sm">
            {user ? (
              user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
            ) : (
              <User className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-heading text-xl font-black text-on-surface tracking-tighter">
          RABBIT HOLE
        </h1>
      </div>
      <div className="relative">
        {user ? (
          <button onClick={() => setOpen(!open)} className="outline-none text-primary hover:opacity-80 transition-opacity active:scale-95 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <Avatar className="w-9 h-9 ring-2 ring-primary-container/50">
              <AvatarFallback className="bg-surface-container-high text-on-surface text-xs">
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
                className="absolute right-0 top-12 z-50 w-48 glass-elevated rounded-2xl p-1.5"
              >
                <p className="px-3 py-2 text-xs text-outline font-label font-medium truncate">{user.email}</p>
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors"
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
