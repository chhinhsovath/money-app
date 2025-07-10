import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Clock,
  Receipt,
  Settings,
  Plus
} from 'lucide-react'

const reports = [
  {
    id: 'profit-loss',
    title: 'Profit & Loss',
    description: 'View income and expenses for a specific period',
    icon: TrendingUp,
    path: '/reports/profit-loss',
    color: 'text-green-600'
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    description: 'Snapshot of assets, liabilities, and equity',
    icon: BarChart3,
    path: '/reports/balance-sheet',
    color: 'text-blue-600'
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Statement',
    description: 'Track cash movements by operating, investing, and financing activities',
    icon: DollarSign,
    path: '/reports/cash-flow',
    color: 'text-purple-600'
  },
  {
    id: 'aged-receivables',
    title: 'Aged Receivables',
    description: 'Outstanding customer invoices by age',
    icon: Clock,
    path: '/reports/aged-receivables',
    color: 'text-orange-600'
  },
  {
    id: 'aged-payables',
    title: 'Aged Payables',
    description: 'Outstanding supplier bills by age',
    icon: Receipt,
    path: '/reports/aged-payables',
    color: 'text-red-600'
  }
]

export default function ReportsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-2">
            Access comprehensive financial reports and insights
          </p>
        </div>
        <Link to="/reports/custom">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Custom Report
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to={report.path}>
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    View Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}