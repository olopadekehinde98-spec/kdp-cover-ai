'use client'

import { UserProfile } from '@clerk/nextjs'

export default function ManageAccountPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-10 px-4">
      <div className="mb-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-white mb-1">Manage Account</h1>
        <p className="text-gray-400 text-sm">Update your email, password, and connected accounts.</p>
      </div>
      <UserProfile
        appearance={{
          elements: {
            rootBox: 'w-full max-w-3xl',
            card: 'bg-gray-900 border border-gray-800 shadow-none rounded-2xl',
            navbar: 'bg-gray-900 border-r border-gray-800',
            navbarButton: 'text-gray-300 hover:text-white',
            navbarButtonIcon: 'text-gray-400',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-400',
            formFieldLabel: 'text-gray-300',
            formFieldInput: 'bg-gray-800 border-gray-700 text-white',
            formButtonPrimary: 'bg-violet-600 hover:bg-violet-700',
            badge: 'bg-violet-900 text-violet-300',
            profileSectionTitle: 'text-white',
            profileSectionContent: 'text-gray-300',
            accordionTriggerButton: 'text-gray-300 hover:text-white',
            pageScrollBox: 'bg-gray-900',
          },
        }}
      />
    </div>
  )
}
