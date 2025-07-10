import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Clock,
  Receipt,
  Settings,
  Plus,
  Search,
  Calendar,
  Download,
  Printer,
  Eye,
  RefreshCw,
  Filter
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import ReportService from '@/services/ReportService'

const reports = [
  {
    id: 'profit-loss',
    title: 'Profit & Loss',
    description: 'View income and expenses for a specific period',
    icon: TrendingUp,
    path: '/reports/profit-loss',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'financial',
    frequency: 'monthly',
    parameters: ['start_date', 'end_date']
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    description: 'Snapshot of assets, liabilities, and equity',
    icon: BarChart3,
    path: '/reports/balance-sheet',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'financial',
    frequency: 'monthly',
    parameters: ['as_of_date']
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Statement',
    description: 'Track cash movements by operating, investing, and financing activities',
    icon: DollarSign,
    path: '/reports/cash-flow',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'financial',
    frequency: 'monthly',
    parameters: ['start_date', 'end_date']
  },
  {
    id: 'aged-receivables',
    title: 'Aged Receivables',
    description: 'Outstanding customer invoices by age',
    icon: Clock,
    path: '/reports/aged-receivables',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    category: 'aging',
    frequency: 'weekly',
    parameters: []
  },
  {
    id: 'aged-payables',
    title: 'Aged Payables',
    description: 'Outstanding supplier bills by age',
    icon: Receipt,
    path: '/reports/aged-payables',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    category: 'aging',
    frequency: 'weekly',
    parameters: []
  }
]

export default function EnhancedReportsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [reportSummaries, setReportSummaries] = useState({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReportSummaries()
  }, [])

  const loadReportSummaries = async () => {
    setLoading(true)
    try {
      // Load quick summaries for each report
      const summaries = {}
      
      // Get current month P&L summary
      const currentMonth = new Date()
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0]
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        .toISOString().split('T')[0]
      
      const plData = await ReportService.getProfitLoss(startDate, endDate)
      summaries['profit-loss'] = {
        revenue: plData.revenue?.total || 0,
        expenses: plData.expenses?.total || 0,
        profit: plData.net_profit || 0
      }

      // Get current balance sheet summary
      const bsData = await ReportService.getBalanceSheet()
      summaries['balance-sheet'] = {
        assets: bsData.assets?.total || 0,
        liabilities: bsData.liabilities?.total || 0,
        equity: bsData.equity?.total || 0
      }

      // Get aged receivables summary
      const arData = await ReportService.getAgedReceivables()
      summaries['aged-receivables'] = {
        total: arData.total_outstanding || 0,
        overdue: (arData.days_1_30?.total || 0) + (arData.days_31_60?.total || 0) + 
                (arData.days_61_90?.total || 0) + (arData.over_90?.total || 0)
      }

      // Get aged payables summary
      const apData = await ReportService.getAgedPayables()
      summaries['aged-payables'] = {
        total: apData.total_outstanding || 0,
        overdue: (apData.days_1_30?.total || 0) + (apData.days_31_60?.total || 0) + 
                (apData.days_61_90?.total || 0) + (apData.over_90?.total || 0)
      }

      setReportSummaries(summaries)
    } catch (error) {
      console.error('Error loading report summaries:', error)
      toast({
        title: 'Warning',
        description: 'Could not load report summaries',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount || 0)
  }

  const getReportSummary = (reportId) => {
    const summary = reportSummaries[reportId]
    if (!summary) return null

    switch (reportId) {
      case 'profit-loss':
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Revenue:</span>
              <span className="text-green-600 font-medium">{formatCurrency(summary.revenue)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Profit:</span>
              <span className={`font-medium ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.profit)}
              </span>
            </div>
          </div>
        )
      case 'balance-sheet':
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Assets:</span>
              <span className="font-medium">{formatCurrency(summary.assets)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Equity:</span>
              <span className="font-medium">{formatCurrency(summary.equity)}</span>
            </div>
          </div>
        )
      case 'aged-receivables':
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Outstanding:</span>
              <span className="font-medium">{formatCurrency(summary.total)}</span>
            </div>
            {summary.overdue > 0 && (
              <div className="flex justify-between text-xs">
                <span>Overdue:</span>
                <span className="text-red-600 font-medium">{formatCurrency(summary.overdue)}</span>
              </div>
            )}
          </div>
        )
      case 'aged-payables':
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Outstanding:</span>
              <span className="font-medium">{formatCurrency(summary.total)}</span>
            </div>
            {summary.overdue > 0 && (
              <div className="flex justify-between text-xs">
                <span>Overdue:</span>
                <span className="text-red-600 font-medium">{formatCurrency(summary.overdue)}</span>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-2">
            Access comprehensive financial reports and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadReportSummaries} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/reports/custom">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Custom Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            All
          </Button>
          <Button
            variant={categoryFilter === 'financial' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('financial')}
          >
            Financial
          </Button>
          <Button
            variant={categoryFilter === 'aging' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('aging')}
          >
            Aging
          </Button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon
          const summary = getReportSummary(report.id)
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {report.frequency}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 text-sm">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary && (
                  <div className="p-3 bg-muted rounded-lg">
                    {summary}
                  </div>
                )}
                <div className="flex gap-2">
                  <Link to={report.path} className="flex-1">
                    <Button className="w-full" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No reports found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Reports
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="mr-2 h-4 w-4" />
              Batch Export
            </Button>
            <Button variant="outline" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Report Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}