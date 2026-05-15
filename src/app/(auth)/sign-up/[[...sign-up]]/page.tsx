import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-gray-900 border border-gray-800 shadow-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-400',
            formFieldLabel: 'text-gray-300',
            formFieldInput: 'bg-gray-800 border-gray-700 text-white',
            footerActionLink: 'text-violet-400',
            formButtonPrimary: 'bg-violet-600 hover:bg-violet-700',
          },
        }}
      />
    </div>
  )
}
