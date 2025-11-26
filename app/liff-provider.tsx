"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { initializeLiff, getUserProfile } from "@/lib/liff"

// Define the shape of the context
interface LiffContextType {
  isInitialized: boolean
  isLoggedIn: boolean
  isInClient: boolean
  profile: any | null
  error: Error | null
  loading: boolean
}

// Create the context with default values
const LiffContext = createContext<LiffContextType>({
  isInitialized: false,
  isLoggedIn: false,
  isInClient: false,
  profile: null,
  error: null,
  loading: true,
})

// Hook to use the LIFF context
export const useLiff = () => useContext(LiffContext)

// Provider component
interface LiffProviderProps {
  children: ReactNode
  liffId: string
}

export function LiffProvider({ children, liffId }: LiffProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInClient, setIsInClient] = useState(false)
  const [profile, setProfile] = useState<any | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true)
        console.log("[v0] Starting LIFF initialization...")

        const initialized = await initializeLiff(liffId)
        console.log("[v0] LIFF initialization result:", initialized)
        setIsInitialized(initialized)

        if (initialized && typeof window !== "undefined" && window.liff) {
          try {
            // Check if user is logged in
            const loggedIn = window.liff.isLoggedIn()
            setIsLoggedIn(loggedIn)
            console.log("[v0] User logged in status:", loggedIn)

            // Check if running in LINE app
            setIsInClient(window.liff.isInClient())

            // Get user profile if logged in
            if (loggedIn) {
              const userProfile = await getUserProfile()
              setProfile(userProfile)
              console.log("[v0] User profile loaded")
            }
          } catch (liffError) {
            console.log("[v0] Error accessing LIFF methods:", liffError)
            // Don't set error state for LIFF access issues in preview
          }
        } else {
          console.log("[v0] LIFF not available - this is expected in preview environment")
        }
      } catch (err) {
        console.log("[v0] LIFF initialization error (non-critical):", err)
        // Only set error for critical failures, not for missing LIFF SDK
        if (err instanceof Error && !err.message.includes("Cannot find module")) {
          setError(err)
        }
      } finally {
        setLoading(false)
        console.log("[v0] LIFF initialization complete")
      }
    }

    initialize().catch((err) => {
      console.log("[v0] Caught unhandled error in LIFF initialization:", err)
      setLoading(false)
    })
  }, [liffId])

  const value = {
    isInitialized,
    isLoggedIn,
    isInClient,
    profile,
    error,
    loading,
  }

  return <LiffContext.Provider value={value}>{children}</LiffContext.Provider>
}
