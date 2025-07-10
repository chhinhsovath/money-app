import { LoginForm } from '@/components/auth/LoginForm'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
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
            Streamline Your Business Accounting
          </h2>
          <p className="text-blue-100 text-lg">
            Manage invoices, track expenses, and gain insights into your financial health - all in one powerful platform.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-blue-200">Active Businesses</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$2.5B</div>
              <div className="text-blue-200">Invoices Processed</div>
            </div>
          </div>
        </div>

        <div className="text-blue-200 text-sm">
          © 2025 AccounTech. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-gray-900 lg:hidden mb-8">
              <Building2 className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold">AccounTech</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-2">
              Sign in to your account to continue
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}