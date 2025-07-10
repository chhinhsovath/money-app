import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CreditCard
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import ReportService from '@/services/ReportService'
import InvoiceService from '@/services/InvoiceService'
import BillService from '@/services/BillService'
import ContactService from '@/services/ContactService'
import BankTransactionService from '@/services/BankTransactionService'
import { useToast } from '@/components/ui/use-toast'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('last30days')
  const [revenueData, setRevenueData] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [cashFlowData, setCashFlowData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    customerCount: 0,
    invoiceCount: 0,
    billCount: 0,
    averageInvoiceValue: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Load all data in parallel
      const [plData, invoices, bills, customers, transactions] = await Promise.all([
        ReportService.getProfitLoss(getDateRange()),
        InvoiceService.getAll(),
        BillService.getAll(),
        ContactService.getAll('customer'),
        BankTransactionService.getAll()
      ])
      
      // Calculate metrics from real data
      const revenue = plData.revenue?.total || 0
      const expenses = plData.expenses?.total || 0
      const profit = revenue - expenses
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0
      
      // Filter invoices by date range
      const dateRange = getDateRange()
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)
      
      const filteredInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issue_date)
        return invDate >= startDate && invDate <= endDate
      })
      
      const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid')
      const avgInvoiceValue = paidInvoices.length > 0 
        ? paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0) / paidInvoices.length 
        : 0

      setMetrics({
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: profit,
        profitMargin: margin,
        customerCount: customers.length,
        invoiceCount: filteredInvoices.length,
        billCount: bills.filter(bill => {
          const billDate = new Date(bill.issue_date)
          return billDate >= startDate && billDate <= endDate
        }).length,
        averageInvoiceValue: avgInvoiceValue
      })

      // Generate real time series data from transactions
      generateRealTimeSeriesData(invoices, bills, transactions, dateRange)
      
      // Generate category data from actual revenue
      generateRealCategoryData(plData)

    } catch (error) {
      console.error('Error loading analytics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    
    switch (dateRange) {
      case 'last7days':
        start.setDate(end.getDate() - 7)
        break
      case 'last30days':
        start.setDate(end.getDate() - 30)
        break
      case 'last90days':
        start.setDate(end.getDate() - 90)
        break
      case 'yearToDate':
        start.setMonth(0)
        start.setDate(1)
        break
      default:
        start.setDate(end.getDate() - 30)
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }

  const generateRealTimeSeriesData = (invoices, bills, transactions, dateRange) => {
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    
    // Create date buckets
    const revenueBuckets = {}
    const expenseBuckets = {}
    const cashFlowBuckets = {}
    
    // Initialize buckets
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      revenueBuckets[dateKey] = 0
      expenseBuckets[dateKey] = 0
      cashFlowBuckets[dateKey] = { inflow: 0, outflow: 0, net: 0 }
    }
    
    // Aggregate invoice data (revenue)
    invoices.forEach(invoice => {
      if (invoice.status === 'paid') {
        const invDate = new Date(invoice.issue_date)
        if (invDate >= startDate && invDate <= endDate) {
          const dateKey = invDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          if (revenueBuckets[dateKey] !== undefined) {
            revenueBuckets[dateKey] += parseFloat(invoice.total || 0)
          }
        }
      }
    })
    
    // Aggregate bill data (expenses)
    bills.forEach(bill => {
      if (bill.status === 'paid') {
        const billDate = new Date(bill.issue_date)
        if (billDate >= startDate && billDate <= endDate) {
          const dateKey = billDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          if (expenseBuckets[dateKey] !== undefined) {
            expenseBuckets[dateKey] += parseFloat(bill.total || 0)
          }
        }
      }
    })
    
    // Process bank transactions for cash flow
    transactions.forEach(trans => {
      const transDate = new Date(trans.date)
      if (transDate >= startDate && transDate <= endDate) {
        const dateKey = transDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (cashFlowBuckets[dateKey]) {
          const amount = parseFloat(trans.amount || 0)
          if (trans.type === 'credit') {
            cashFlowBuckets[dateKey].inflow += amount
          } else if (trans.type === 'debit') {
            cashFlowBuckets[dateKey].outflow += amount
          }
        }
      }
    })
    
    // Convert to arrays
    const revenueArray = Object.entries(revenueBuckets).map(([date, value]) => ({ date, value }))
    const expenseArray = Object.entries(expenseBuckets).map(([date, value]) => ({ date, value }))
    const cashFlowArray = Object.entries(cashFlowBuckets).map(([date, data]) => ({
      date,
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow
    }))
    
    setRevenueData(revenueArray)
    setExpenseData(expenseArray)
    setCashFlowData(cashFlowArray)
  }

  const generateRealCategoryData = (plData) => {
    const categories = []
    
    if (plData.revenue && plData.revenue.categories) {
      Object.entries(plData.revenue.categories).forEach(([category, data]) => {
        if (data.total > 0) {
          categories.push({
            name: category.charAt(0).toUpperCase() + category.slice(1),
            value: data.total
          })
        }
      })
    }
    
    // If no categories, show total revenue as single category
    if (categories.length === 0 && plData.revenue?.total > 0) {
      categories.push({
        name: 'Revenue',
        value: plData.revenue.total
      })
    }
    
    setCategoryData(categories)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 'last7days' ? 'default' : 'outline'}
            onClick={() => setDateRange('last7days')}
          >
            Last 7 days
          </Button>
          <Button
            variant={dateRange === 'last30days' ? 'default' : 'outline'}
            onClick={() => setDateRange('last30days')}
          >
            Last 30 days
          </Button>
          <Button
            variant={dateRange === 'last90days' ? 'default' : 'outline'}
            onClick={() => setDateRange('last90days')}
          >
            Last 90 days
          </Button>
          <Button
            variant={dateRange === 'yearToDate' ? 'default' : 'outline'}
            onClick={() => setDateRange('yearToDate')}
          >
            Year to date
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              -8.2% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.netProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Margin: {formatPercent(metrics.profitMargin)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customerCount}</div>
            <p className="text-xs text-muted-foreground">
              +3 new this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="categories">Revenue by Category</TabsTrigger>
          <TabsTrigger value="comparison">Income vs Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Daily revenue for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0088FE"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>Money in vs money out</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="inflow" fill="#00C49F" name="Inflow" />
                  <Bar dataKey="outflow" fill="#FF8042" name="Outflow" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Breakdown of revenue sources</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${formatCurrency(entry.value)})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Compare revenue and expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="inflow"
                    stroke="#00C49F"
                    name="Income"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="outflow"
                    stroke="#FF8042"
                    name="Expenses"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#8884D8"
                    name="Net"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Best selling items this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Consulting Services', 'Software License', 'Support Package', 'Training Workshop'].map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">{product}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(Math.floor(Math.random() * 50000) + 10000)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New invoice created</p>
                  <p className="text-xs text-muted-foreground">INV-2024-001 for $5,230</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">$3,450 from Acme Corp</p>
                </div>
                <span className="text-xs text-muted-foreground">5h ago</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New customer added</p>
                  <p className="text-xs text-muted-foreground">Tech Solutions Inc.</p>
                </div>
                <span className="text-xs text-muted-foreground">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}