import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import reportService from '@/services/ReportService'
import { useToast } from '@/components/ui/use-toast'
import ReportBuilder from '@/components/reports/ReportBuilder'
import DynamicReportTable from '@/components/reports/DynamicReportTable'
import { exportReport } from '@/utils/reportExport'

export default function EnhancedProfitLossReport() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [tableData, setTableData] = useState([])
  const [visibleColumns, setVisibleColumns] = useState([])
  
  const currentDate = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0])

  // Define all available columns
  const columns = [
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'code', label: 'Account Code', type: 'text' },
    { key: 'name', label: 'Account Name', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
    { key: 'percentage', label: '% of Total', type: 'percentage', align: 'right' },
    { key: 'type', label: 'Type', type: 'text' }
  ]

  // Define filters
  const filters = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'Revenue', label: 'Revenue' },
        { value: 'Expenses', label: 'Expenses' }
      ]
    },
    {
      key: 'amount_range',
      label: 'Amount Range',
      type: 'select',
      options: [
        { value: 'all', label: 'All Amounts' },
        { value: 'under_1000', label: 'Under $1,000' },
        { value: '1000_5000', label: '$1,000 - $5,000' },
        { value: '5000_10000', label: '$5,000 - $10,000' },
        { value: 'over_10000', label: 'Over $10,000' }
      ]
    },
    {
      key: 'account_type',
      label: 'Account Type',
      type: 'select',
      options: [
        { value: 'revenue', label: 'Revenue' },
        { value: 'other_income', label: 'Other Income' },
        { value: 'expense', label: 'Operating Expense' },
        { value: 'cost_of_goods_sold', label: 'Cost of Goods Sold' },
        { value: 'other_expense', label: 'Other Expense' }
      ]
    }
  ]

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await reportService.getProfitLoss(startDate, endDate)
      const data = response.data
      setReport(data)
      
      // Transform data for table display
      const transformedData = []
      
      // Add revenue accounts
      data.revenue.accounts.forEach(acc => {
        transformedData.push({
          id: `rev-${acc.code}`,
          category: 'Revenue',
          code: acc.code,
          name: acc.name,
          amount: parseFloat(acc.amount),
          percentage: data.revenue.total > 0 ? parseFloat(acc.amount) / data.revenue.total : 0,
          type: 'revenue'
        })
      })
      
      // Add expense accounts
      data.expenses.accounts.forEach(acc => {
        transformedData.push({
          id: `exp-${acc.code}`,
          category: 'Expenses',
          code: acc.code,
          name: acc.name,
          amount: parseFloat(acc.amount),
          percentage: data.expenses.total > 0 ? parseFloat(acc.amount) / data.expenses.total : 0,
          type: 'expense'
        })
      })
      
      setTableData(transformedData)
      setVisibleColumns(['category', 'code', 'name', 'amount', 'percentage'])
    } catch (error) {
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

  const handleFilterChange = (filters) => {
    let filteredData = [...tableData]
    
    if (filters.category) {
      filteredData = filteredData.filter(row => row.category === filters.category)
    }
    
    if (filters.amount_range && filters.amount_range !== 'all') {
      switch (filters.amount_range) {
        case 'under_1000':
          filteredData = filteredData.filter(row => row.amount < 1000)
          break
        case '1000_5000':
          filteredData = filteredData.filter(row => row.amount >= 1000 && row.amount < 5000)
          break
        case '5000_10000':
          filteredData = filteredData.filter(row => row.amount >= 5000 && row.amount < 10000)
          break
        case 'over_10000':
          filteredData = filteredData.filter(row => row.amount >= 10000)
          break
      }
    }
    
    if (filters.account_type) {
      filteredData = filteredData.filter(row => row.type === filters.account_type)
    }
    
    // Update the table data (in real app, you'd manage this state better)
    setTableData(filteredData)
  }

  const handleExport = (format, exportData) => {
    exportReport(
      format,
      exportData.data,
      exportData.columns,
      `Profit & Loss Report (${startDate} to ${endDate})`,
      `profit-loss-${startDate}-${endDate}`
    )
  }

  const calculateTotals = (data, columns) => {
    const totals = {}
    columns.forEach(col => {
      if (col.key === 'amount') {
        totals[col.key] = data.reduce((sum, row) => sum + row.amount, 0)
      }
    })
    return totals
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
          <h1 className="text-3xl font-bold">Enhanced Profit & Loss Report</h1>
          <p className="text-muted-foreground">Advanced filtering and export options</p>
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

          {/* Advanced Report Table */}
          <ReportBuilder
            title="Detailed Profit & Loss"
            columns={columns}
            data={tableData}
            filters={filters}
            onFilterChange={handleFilterChange}
            onColumnsChange={setVisibleColumns}
            onExport={handleExport}
            defaultVisibleColumns={visibleColumns}
          >
            <DynamicReportTable
              data={tableData}
              columns={columns}
              visibleColumns={visibleColumns}
              showTotals={true}
              calculateTotals={calculateTotals}
              groupBy=""
              sortBy="amount"
              sortOrder="desc"
              getRowClassName={(row) => {
                if (row.category === 'Revenue') return 'bg-green-50 hover:bg-green-100'
                if (row.category === 'Expenses') return 'bg-red-50 hover:bg-red-100'
                return ''
              }}
            />
          </ReportBuilder>
        </>
      )}
    </div>
  )
}