import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  CreditCard,
  BarChart3,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
  Building2,
  Wallet,
  DollarSign,
  Bell,
  Search,
  HelpCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const navigation = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
      { name: 'Analytics', href: '/analytics', icon: TrendingUp, badge: 'New' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { name: 'Invoices', href: '/invoices', icon: FileText, badge: '12' },
      { name: 'Customers', href: '/contacts', icon: Users, badge: null },
    ],
  },
  {
    title: 'Purchases',
    items: [
      { name: 'Bills', href: '/bills', icon: Receipt, badge: '5' },
      { name: 'Expenses', href: '/expenses', icon: Wallet, badge: null },
      { name: 'Vendors', href: '/vendors', icon: Building2, badge: null },
    ],
  },
  {
    title: 'Banking',
    items: [
      { name: 'Accounts', href: '/bank-accounts', icon: CreditCard, badge: null },
      { name: 'Transactions', href: '/transactions', icon: DollarSign, badge: '23' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { name: 'Financial Reports', href: '/reports', icon: BarChart3, badge: null },
      { name: 'Tax Reports', href: '/tax-reports', icon: FileText, badge: null },
    ],
  },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const quickCreateItems = [
    { name: 'New Invoice', href: '/invoices/new', icon: FileText, color: 'text-blue-600' },
    { name: 'New Bill', href: '/bills/new', icon: Receipt, color: 'text-green-600' },
    { name: 'New Expense', href: '/expenses/new', icon: Wallet, color: 'text-purple-600' },
    { name: 'New Customer', href: '/contacts/new', icon: Users, color: 'text-orange-600' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-gray-900/50 lg:hidden transition-opacity',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AccounTech</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className={cn(
                  "pl-9 pr-4 py-2 bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                  searchFocused && "ring-2 ring-blue-500"
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 overflow-y-auto">
            {navigation.map((section, sectionIndex) => (
              <div key={section.title} className={cn(sectionIndex > 0 && "mt-6")}>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <Icon className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                        )} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'New' ? 'default' : 'secondary'}
                            className={cn(
                              "ml-auto",
                              item.badge === 'New' 
                                ? "bg-green-100 text-green-700 hover:bg-green-100" 
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Breadcrumb */}
            <nav className="hidden lg:flex items-center gap-2 text-sm">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick create */}
            <div className="relative">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setQuickCreateOpen(!quickCreateOpen)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              {quickCreateOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setQuickCreateOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2">
                    {quickCreateItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setQuickCreateOpen(false)}
                        >
                          <Icon className={cn("h-5 w-5", item.color)} />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}