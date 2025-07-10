import { RegisterForm } from '@/components/auth/RegisterForm'
import { Building2 } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <Building2 className="h-10 w-10" />
            <span className="text-2xl font-bold">AccounTech</span>
          </div>
        </div>
        
        <div className="space-y-6 text-white">
          <h2 className="text-4xl font-bold leading-tight">
            Start Your Financial Journey
          </h2>
          <p className="text-blue-100 text-lg">
            Join thousands of businesses already using AccounTech to streamline their accounting and grow their revenue.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div>
              <div className="text-3xl font-bold">30 days</div>
              <div className="text-blue-200">Free trial</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-blue-200">Customer support</div>
            </div>
          </div>
        </div>

        <div className="text-blue-200 text-sm">
          © 2025 AccounTech. All rights reserved.
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-gray-900 lg:hidden mb-8">
              <Building2 className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold">AccounTech</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-600 mt-2">
              Get started with your free 30-day trial
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}