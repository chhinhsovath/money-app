import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calculator, 
  Receipt, 
  DollarSign, 
  FileText,
  Settings,
  AlertTriangle,
  TrendingUp,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Download,
  Printer
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import TaxService from '@/services/TaxService'
import { formatCurrency } from '@/lib/utils'

const taxReports = [
  {
    id: 'sales-tax',
    title: 'Sales Tax Report',
    description: 'VAT/GST collected vs paid analysis',
    icon: Receipt,
    path: '/tax-reports/sales-tax',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'compliance',
    frequency: 'monthly'
  },
  {
    id: 'income-tax',
    title: 'Income Tax Report',
    description: 'Business income tax calculation and estimates',
    icon: Calculator,
    path: '/tax-reports/income-tax',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'compliance',
    frequency: 'annual'
  },
  {
    id: 'tax-liability',
    title: 'Tax Liability',
    description: 'Current tax obligations and due dates',
    icon: AlertTriangle,
    path: '/tax-reports/liability',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    category: 'compliance',
    frequency: 'ongoing'
  },
  {
    id: 'audit-trail',
    title: 'Tax Audit Trail',
    description: 'Complete tax transaction history for compliance',
    icon: FileText,
    path: '/tax-reports/audit-trail',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'audit',
    frequency: 'as-needed'
  }
]

export default function TaxReportsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [taxSummary, setTaxSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTaxSummary()
  }, [])

  const loadTaxSummary = async () => {
    setLoading(true)
    try {
      // Get current month dates
      const currentDate = new Date()
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        .toISOString().split('T')[0]
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        .toISOString().split('T')[0]

      // Load summary data
      const [salesTaxData, incomeTaxData, liabilityData] = await Promise.all([
        TaxService.getSalesTaxReport(startDate, endDate),
        TaxService.getIncomeTaxReport(startDate, endDate),
        TaxService.getTaxLiability()
      ])

      setTaxSummary({
        salesTax: {
          collected: salesTaxData.summary?.tax_collected || 0,
          paid: salesTaxData.summary?.tax_paid || 0,
          liability: salesTaxData.summary?.net_liability || 0
        },
        incomeTax: {
          taxableIncome: incomeTaxData.income_calculation?.taxable_income || 0,
          estimatedTax: incomeTaxData.income_calculation?.estimated_income_tax || 0,
          effectiveRate: incomeTaxData.income_calculation?.effective_tax_rate || 0
        },
        liability: {
          total: liabilityData.total_liability || 0,
          nextDue: liabilityData.next_filing_date
        }
      })

    } catch (error) {
      console.error('Error loading tax summary:', error)
      toast({
        title: 'Warning',
        description: 'Could not load tax summary data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = taxReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Reports</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive tax reporting and compliance tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTaxSummary} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/tax-reports/rates">
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Tax Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Tax Summary Cards */}
      {taxSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sales Tax Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={taxSummary.salesTax.liability >= 0 ? 'text-orange-600' : 'text-green-600'}>
                  {formatCurrency(Math.abs(taxSummary.salesTax.liability))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {taxSummary.salesTax.liability >= 0 ? 'Amount owed' : 'Credit available'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Taxable Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(taxSummary.incomeTax.taxableIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {taxSummary.incomeTax.effectiveRate.toFixed(1)}% effective rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Estimated Income Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(taxSummary.incomeTax.estimatedTax)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current year estimate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tax Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={taxSummary.liability.total >= 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(Math.abs(taxSummary.liability.total))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current obligations
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tax reports..."
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
            variant={categoryFilter === 'compliance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('compliance')}
          >
            Compliance
          </Button>
          <Button
            variant={categoryFilter === 'audit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('audit')}
          >
            Audit
          </Button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon
          
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
            Tax Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/tax-reports/rates">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Manage Tax Rates
              </Button>
            </Link>
            <Button variant="outline" className="justify-start">
              <Plus className="mr-2 h-4 w-4" />
              File Tax Return
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="mr-2 h-4 w-4" />
              Export All Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}