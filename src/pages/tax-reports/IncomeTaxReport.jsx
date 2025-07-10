import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import TaxService from '@/services/TaxService'
import { useToast } from '@/components/ui/use-toast'
import { exportReport } from '@/utils/reportExport'

export default function IncomeTaxReport() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  
  const currentDate = new Date()
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1)
  const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31)
  
  const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(lastDayOfYear.toISOString().split('T')[0])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await TaxService.getIncomeTaxReport(startDate, endDate)
      setReport(response)
    } catch (error) {
      console.error('Error fetching income tax report:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch income tax report',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleGenerateReport = (e) => {
    e.preventDefault()
    fetchReport()
  }

  const handleExport = (format) => {
    if (!report) return
    
    const data = [
      {
        category: 'Revenue',
        description: 'Gross Revenue',
        amount: report.revenue.gross_revenue
      },
      {
        category: 'Revenue',
        description: 'Sales Tax (excluded)',
        amount: report.revenue.sales_tax
      },
      {
        category: 'Expenses',
        description: 'Total Deductible Expenses',
        amount: report.expenses.total_expenses
      },
      {
        category: 'Expenses',
        description: 'Purchase Tax (excluded)',
        amount: report.expenses.purchase_tax
      },
      {
        category: 'Tax Calculation',
        description: 'Taxable Income',
        amount: report.income_calculation.taxable_income
      },
      {
        category: 'Tax Calculation',
        description: 'Estimated Income Tax',
        amount: report.income_calculation.estimated_income_tax
      }
    ]
    
    const columns = [
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency', align: 'right' }
    ]
    
    exportReport(
      format,
      data,
      columns,
      `Income Tax Report (${startDate} to ${endDate})`,
      `income-tax-${startDate}-${endDate}`
    )
  }

  // Tax bracket information (example - would be configurable)
  const taxBrackets = [
    { min: 0, max: 50000, rate: 20, description: 'First $50,000' },
    { min: 50000, max: 100000, rate: 25, description: '$50,001 - $100,000' },
    { min: 100000, max: Infinity, rate: 30, description: 'Over $100,000' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/tax-reports')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Income Tax Report</h1>
          <p className="text-muted-foreground">Business income tax calculation and estimates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Year Period</CardTitle>
          <CardDescription>Select the financial year for your income tax calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateReport} className="flex gap-4 items-end">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Tax'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(report.revenue.gross_revenue)}
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Excluding sales tax
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Deductible Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(report.expenses.total_expenses)}
                  </div>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Business expenses
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Taxable Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.income_calculation.taxable_income)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue minus expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(report.income_calculation.estimated_income_tax)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.income_calculation.effective_tax_rate.toFixed(1)}% effective rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Income Calculation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Income Calculation
                </CardTitle>
                <CardDescription>Breakdown of taxable income calculation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Gross Revenue</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(report.revenue.gross_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Less: Business Expenses</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(report.expenses.total_expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 pt-4 border-t font-bold">
                    <span>Taxable Income</span>
                    <span>{formatCurrency(report.income_calculation.taxable_income)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Tax Brackets
                </CardTitle>
                <CardDescription>Progressive tax calculation breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxBrackets.map((bracket, index) => {
                    const taxableIncome = report.income_calculation.taxable_income
                    const applicableIncome = Math.max(0, Math.min(
                      taxableIncome - bracket.min,
                      bracket.max - bracket.min
                    ))
                    const taxOnBracket = applicableIncome * (bracket.rate / 100)
                    
                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{bracket.description}</p>
                          <p className="text-sm text-muted-foreground">{bracket.rate}% rate</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(taxOnBracket)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            on {formatCurrency(applicableIncome)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center pt-4 border-t font-bold">
                    <span>Total Income Tax</span>
                    <span className="text-red-600">
                      {formatCurrency(report.income_calculation.estimated_income_tax)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export & Actions</CardTitle>
              <CardDescription>Export your income tax report for filing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => handleExport('excel')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleExport('csv')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <Calculator className="mr-2 h-4 w-4" />
                  Generate Tax Forms
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}