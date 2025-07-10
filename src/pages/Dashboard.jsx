import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  Calendar,
  Users,
  ShoppingCart,
  Activity,
  Eye,
} from 'lucide-react'
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Outstanding Invoices',
    value: '$12,234.00',
    change: '-5.4%',
    changeType: 'negative',
    icon: Receipt,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    name: 'Total Expenses',
    value: '$30,423.00',
    change: '+10.2%',
    changeType: 'negative',
    icon: CreditCard,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    name: 'Net Profit',
    value: '$14,808.89',
    change: '+15.3%',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
]

const revenueData = [
  { month: 'Jan', revenue: 35000, expenses: 28000 },
  { month: 'Feb', revenue: 38000, expenses: 29000 },
  { month: 'Mar', revenue: 42000, expenses: 31000 },
  { month: 'Apr', revenue: 39000, expenses: 30000 },
  { month: 'May', revenue: 44000, expenses: 32000 },
  { month: 'Jun', revenue: 45231, expenses: 30423 },
]

const cashFlowData = [
  { day: 'Mon', amount: 5400 },
  { day: 'Tue', amount: 4200 },
  { day: 'Wed', amount: 6800 },
  { day: 'Thu', amount: 5900 },
  { day: 'Fri', amount: 8200 },
  { day: 'Sat', amount: 7100 },
  { day: 'Sun', amount: 6300 },
]

const recentInvoices = [
  { id: 'INV-001', client: 'Acme Corporation', amount: 1250.00, status: 'paid', date: '2025-07-08' },
  { id: 'INV-002', client: 'Global Tech Inc', amount: 2100.00, status: 'pending', date: '2025-07-07' },
  { id: 'INV-003', client: 'StartUp Solutions', amount: 850.00, status: 'overdue', date: '2025-06-25' },
  { id: 'INV-004', client: 'Digital Agency Pro', amount: 3200.00, status: 'paid', date: '2025-07-06' },
  { id: 'INV-005', client: 'Cloud Services Ltd', amount: 1800.00, status: 'pending', date: '2025-07-05' },
]

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('month')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg", stat.lightColor)}>
                    <Icon className={cn("h-5 w-5", stat.iconColor)} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Revenue & Expenses</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Cash Flow</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invoice.id}</p>
                      <p className="text-sm text-gray-500">{invoice.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{invoice.date}</p>
                    </div>
                    <Badge
                      variant={
                        invoice.status === 'paid' ? 'success' :
                        invoice.status === 'pending' ? 'warning' :
                        'destructive'
                      }
                      className={cn(
                        "capitalize",
                        invoice.status === 'paid' && "bg-green-100 text-green-700",
                        invoice.status === 'pending' && "bg-yellow-100 text-yellow-700",
                        invoice.status === 'overdue' && "bg-red-100 text-red-700"
                      )}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-xl font-semibold text-gray-900">284</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">+12%</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="text-xl font-semibold text-gray-900">42</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">+3%</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-xl font-semibold text-gray-900">24.8%</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">+5.2%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}