import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Invoices', href: '/invoices', icon: FileText },
      { name: 'Bills', href: '/bills', icon: Receipt },
      { name: 'Expenses', href: '/expenses', icon: CreditCard },
      { name: 'Contacts', href: '/contacts', icon: Users },
      { name: 'Products & Services', href: '/items', icon: Package },
    ],
  },
  {
    title: 'Accounting',
    items: [
      { name: 'Bank Accounts', href: '/bank-accounts', icon: CreditCard },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Chart of Accounts', href: '/accounts', icon: FileText },
    ],
  },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const quickCreateItems = [
    { name: 'Invoice', href: '/invoices/new' },
    { name: 'Bill', href: '/bills/new' },
    { name: 'Expense', href: '/expenses/new' },
    { name: 'Contact', href: '/contacts/new' },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/80 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link to="/dashboard" className="text-xl font-bold">
              MoneyApp
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

          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-secondary text-secondary-foreground'
                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                        )}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickCreateOpen(!quickCreateOpen)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              {quickCreateOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-10">
                  {quickCreateItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-4 py-2 text-sm hover:bg-secondary"
                      onClick={() => setQuickCreateOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}