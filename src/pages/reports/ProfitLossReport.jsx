import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import reportService from '@/services/ReportService'
import { useToast } from '@/components/ui/use-toast'
import ReportBuilder from '@/components/reports/ReportBuilder'
import DynamicReportTable from '@/components/reports/DynamicReportTable'
import { exportReport } from '@/utils/reportExport'

export default function ProfitLossReport() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  
  const currentDate = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await reportService.getProfitLoss(startDate, endDate)
      setReport(response)
    } catch (error) {
      console.error('Error fetching P&L report:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch profit & loss report',
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

  const handleExport = (format, exportData) => {
    if (!report) return
    
    // Prepare revenue data
    const revenueData = report.revenue.accounts.map(acc => ({
      category: 'Revenue',
      code: acc.code,
      name: acc.name,
      amount: acc.amount
    }))
    
    // Prepare expense data
    const expenseData = report.expenses.accounts.map(acc => ({
      category: 'Expenses',
      code: acc.code,
      name: acc.name,
      amount: acc.amount
    }))
    
    // Combine all data
    const allData = [...revenueData, ...expenseData]
    
    // Define columns for export
    const columns = [
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'code', label: 'Account Code', type: 'text' },
      { key: 'name', label: 'Account Name', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency', align: 'right' }
    ]
    
    exportReport(
      format,
      allData,
      columns,
      `Profit & Loss Report (${startDate} to ${endDate})`,
      `profit-loss-${startDate}-${endDate}`
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/reports')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Report</h1>
          <p className="text-muted-foreground">Income and expenses summary</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the date range for your report</CardDescription>
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
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(report.revenue.total)}
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(report.expenses.total)}
                  </div>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={report.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(report.net_profit)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.profit_margin.toFixed(2)}% margin
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Income by account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.revenue.accounts.map((account) => (
                  <div key={account.code} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{account.code} - {account.name}</p>
                    </div>
                    <p className="font-medium text-green-600">
                      {formatCurrency(account.amount)}
                    </p>
                  </div>
                ))}
                {report.revenue.accounts.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No revenue recorded</p>
                )}
                <div className="flex justify-between items-center pt-4 font-bold">
                  <p>Total Revenue</p>
                  <p className="text-green-600">{formatCurrency(report.revenue.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Details */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>Expenses by account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.expenses.accounts.map((account) => (
                  <div key={account.code} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{account.code} - {account.name}</p>
                    </div>
                    <p className="font-medium text-red-600">
                      {formatCurrency(account.amount)}
                    </p>
                  </div>
                ))}
                {report.expenses.accounts.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No expenses recorded</p>
                )}
                <div className="flex justify-between items-center pt-4 font-bold">
                  <p>Total Expenses</p>
                  <p className="text-red-600">{formatCurrency(report.expenses.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}