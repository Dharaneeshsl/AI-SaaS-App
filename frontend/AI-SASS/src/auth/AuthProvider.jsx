import {
  ClerkProvider,
  PricingTable,
  SignIn,
  useAuth as useClerkAuth,
  useClerk,
  useUser,
} from '@clerk/clerk-react'
import { AuthContext, useAuth } from './authContext'
import { getEnv } from '../config/env'

// Used when Clerk is not configured so the full product still works in demo mode.
const demoGuestUser = {
  id: 'demo-guest',
  firstName: 'Guest',
  fullName: 'Demo Guest',
  imageUrl: '',
}

const missingEnvState = {
  isConfigured: false,
  isDemoMode: true,
  user: demoGuestUser,
  openSignIn: () => {},
  signOut: () => {},
  openUserProfile: () => {},
  getToken: async () => null,
}

const ClerkAuthBridge = ({ children }) => {
  const { user } = useUser()
  const { openSignIn, signOut, openUserProfile } = useClerk()
  const { getToken } = useClerkAuth()

  return (
    <AuthContext.Provider
      value={{
        isConfigured: true,
        isDemoMode: false,
        user,
        openSignIn,
        signOut,
        openUserProfile,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const AuthProvider = ({ children }) => {
  const publishableKey = getEnv('VITE_CLERK_PUBLISHABLE_KEY')

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-6 text-left">
        {/* Free Plan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 uppercase tracking-wide">Starter</span>
            <h3 className="mt-4 text-2xl font-bold text-gray-900">Free Plan</h3>
            <p className="mt-2 text-sm text-gray-500">Perfect for exploring and creating your first AI assets.</p>
            <div className="mt-6 flex items-baseline text-4xl font-extrabold text-gray-900">
              $0
              <span className="ml-1 text-sm font-medium text-gray-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">✓ 10 AI generations per month</li>
              <li className="flex items-center gap-2">✓ Article &amp; Blog title writers</li>
              <li className="flex items-center gap-2">✓ Resume reviewer tool</li>
              <li className="flex items-center gap-2">✓ Community feed access &amp; sharing</li>
              <li className="flex items-center gap-2">✓ Fast browser downloads</li>
            </ul>
          </div>
          <a href="/ai" className="mt-8 block w-full rounded-xl bg-gray-100 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-200">
            Get Started Free
          </a>
        </div>

        {/* Pro Plan */}
        <div className="rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-md flex flex-col justify-between relative hover:shadow-lg transition">
          <div className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white uppercase tracking-wider">
            Most Popular
          </div>
          <div>
            <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600 uppercase tracking-wide">Pro</span>
            <h3 className="mt-4 text-2xl font-bold text-gray-900">Pro Plan</h3>
            <p className="mt-2 text-sm text-gray-500">For creators and teams who need unlimited creativity.</p>
            <div className="mt-6 flex items-baseline text-4xl font-extrabold text-gray-900">
              $19
              <span className="ml-1 text-sm font-medium text-gray-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">✓ 500 AI generations per month</li>
              <li className="flex items-center gap-2">✓ Claude 3.5 &amp; GPT-image generation</li>
              <li className="flex items-center gap-2">✓ AI background cutout &amp; object removal</li>
              <li className="flex items-center gap-2">✓ Long-form high-capacity articles</li>
              <li className="flex items-center gap-2">✓ Priority generation queue</li>
            </ul>
          </div>
          <a href="/ai" className="mt-8 block w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
            Upgrade to Pro
          </a>
        </div>
      </div>
    )
  }

  return <PricingTable />
}
