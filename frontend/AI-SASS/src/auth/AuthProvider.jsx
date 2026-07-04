import {
  ClerkProvider,
  PricingTable,
  SignIn,
  useClerk,
  useUser,
} from '@clerk/clerk-react'
import { AuthContext, useAuth } from './authContext'

const missingEnvState = {
  isConfigured: false,
  user: null,
  openSignIn: () => {},
  signOut: () => {},
  openUserProfile: () => {},
}

const ClerkAuthBridge = ({ children }) => {
  const { user } = useUser()
  const { openSignIn, signOut, openUserProfile } = useClerk()

  return (
    <AuthContext.Provider
      value={{
        isConfigured: true,
        user,
        openSignIn,
        signOut,
        openUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const AuthProvider = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    return (
      <AuthContext.Provider value={missingEnvState}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  )
}

export const AuthGate = () => {
  const { isConfigured } = useAuth()

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Authentication setup required</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Add your Clerk publishable key as VITE_CLERK_PUBLISHABLE_KEY to enable sign in,
            protected tools, pricing, and account controls.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  )
}

export const BillingPlans = () => {
  const { isConfigured } = useAuth()

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
        Connect Clerk billing in your environment to show live subscription plans.
      </div>
    )
  }

  return <PricingTable />
}
