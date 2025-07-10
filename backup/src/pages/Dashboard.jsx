import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Outstanding Invoices',
    value: '$12,234.00',
    change: '-5.4%',
    changeType: 'negative',
    icon: Receipt,
  },
  {
    name: 'Total Expenses',
    value: '$30,423.00',
    change: '+10.2%',
    changeType: 'negative',
    icon: CreditCard,
  },
  {
    name: 'Net Profit',
    value: '$14,808.89',
    change: '+15.3%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span
                    className={
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart will be implemented here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Invoice #1234</p>
                  <p className="text-xs text-muted-foreground">ABC Company</p>
                </div>
                <p className="text-sm font-medium text-green-600">+$1,250.00</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Bill #5678</p>
                  <p className="text-xs text-muted-foreground">XYZ Supplies</p>
                </div>
                <p className="text-sm font-medium text-red-600">-$350.00</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Invoice #1235</p>
                  <p className="text-xs text-muted-foreground">DEF Corp</p>
                </div>
                <p className="text-sm font-medium text-green-600">+$2,100.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}