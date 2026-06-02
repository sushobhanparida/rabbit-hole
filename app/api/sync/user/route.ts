import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(req: Request) {
  try {
    const { email, name, password, mode = "signup" } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (mode === "login") {
      const { data: user, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (user.password_hash !== hashPassword(password)) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 })
      }

      return NextResponse.json({ user })
    }

    if (!name) {
      return NextResponse.json({ error: "Name required for signup" }, { status: 400 })
    }

    const existing = await supabase.from("users").select().eq("email", email).single()

    if (existing.data) {
      const { data, error } = await supabase
        .from("users")
        .update({ name })
        .eq("id", existing.data.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ user: data })
    }

    const password_hash = hashPassword(password)

    const { data, error } = await supabase
      .from("users")
      .insert({ email, name, password_hash })
      .select()
      .single()

    if (error) throw error

    await supabase.from("profiles").insert({ user_id: data.id, total_xp: 0 })

    return NextResponse.json({ user: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from("users").select().eq("id", userId).single()

    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
