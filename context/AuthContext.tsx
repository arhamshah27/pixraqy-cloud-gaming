"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/utils/supabase/client"

export type SubscriptionTier = "free" | "premium" | "enterprise"

export interface AppUser {
  id: string
  email: string
  subscription_tier: SubscriptionTier
  credits: number
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  appUser: AppUser | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAppUser = async (userId: string): Promise<AppUser | null> => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching app user:", error)
        return null
      }

      return data as AppUser
    } catch (error) {
      console.error("Error fetching app user:", error)
      return null
    }
  }

  const createAppUser = async (authUser: User): Promise<AppUser | null> => {
    try {
      const newUser: Omit<AppUser, "created_at" | "updated_at"> = {
        id: authUser.id,
        email: authUser.email!,
        subscription_tier: "free",
        credits: 20,
      }

      const { data, error } = await supabase.from("users").insert([newUser]).select().single()

      if (error) {
        console.error("Error creating app user:", error)
        return null
      }

      return data as AppUser
    } catch (error) {
      console.error("Error creating app user:", error)
      return null
    }
  }

  const refreshUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        setSession(session)

        // Try to fetch existing app user
        let appUserData = await fetchAppUser(session.user.id)

        // If app user doesn't exist, create one
        if (!appUserData) {
          appUserData = await createAppUser(session.user)
        }

        setAppUser(appUserData)
      } else {
        setUser(null)
        setSession(null)
        setAppUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
      setSession(null)
      setAppUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      } else {
        setUser(null)
        setSession(null)
        setAppUser(null)
      }
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    refreshUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setSession(session)

        // Try to fetch existing app user
        let appUserData = await fetchAppUser(session.user.id)

        // If app user doesn't exist, create one
        if (!appUserData) {
          appUserData = await createAppUser(session.user)
        }

        setAppUser(appUserData)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setSession(null)
        setAppUser(null)
      } else if (event === "TOKEN_REFRESHED" && session) {
        setSession(session)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    appUser,
    session,
    loading,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
