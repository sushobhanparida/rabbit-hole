"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { LogIn, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function LoginDialog() {
  const login = useStore((s) => s.login)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"signup" | "login">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    if (mode === "signup" && !name.trim()) return
    setSyncing(true)
    setError("")
    try {
      const res = await fetch("/api/sync/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          password: password.trim(),
          mode,
        }),
      })
      const data = await res.json()
      if (data.user) {
        login(data.user.id, email.trim(), password.trim(), data.user.name || name.trim())
        setOpen(false)
        setEmail("")
        setPassword("")
        setName("")
      } else {
        setError(data.error || "Something went wrong")
      }
    } catch {
      setError("Could not connect to server")
    } finally {
      setSyncing(false)
    }
  }

  const switchMode = () => {
    setMode(mode === "signup" ? "login" : "signup")
    setError("")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-5 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97]"
      >
        <LogIn className="h-4 w-4" />
        Login
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-[15%] mx-auto max-w-sm bg-white rounded-[24px] z-50 p-6 shadow-xl border border-[#f0f0f0]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1a1a1a]">
                  {mode === "signup" ? "Sign up" : "Log in"}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[#a3a3a3] hover:text-[#1a1a1a] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {mode === "signup" && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full h-12 px-4 bg-[#f8f8f8] border border-[#e4e4e4] rounded-[16px] text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
                  />
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full h-12 px-4 bg-[#f8f8f8] border border-[#e4e4e4] rounded-[16px] text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full h-12 px-4 bg-[#f8f8f8] border border-[#e4e4e4] rounded-[16px] text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
                />
                {error && (
                  <p className="text-xs text-red-500 mt-0.5">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={syncing}
                  className="w-full h-12 mt-1 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97] disabled:opacity-50"
                >
                  {syncing ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
                </button>
              </form>

              <button
                onClick={switchMode}
                className="w-full text-xs text-[#a3a3a3] text-center mt-4 hover:text-[#525252] transition-colors"
              >
                {mode === "signup" ? "Already have an account? Log in" : "Don't have an account? Sign up"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
