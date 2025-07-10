import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, TrendingUp, TrendingDown, Building2, Package, Banknote } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import reportService from '@/services/ReportService'
import { useToast } from '@/components/ui/use-toast'

export default function CashFlowReport() {
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
      const response = await reportService.getCashFlow(startDate, endDate)
      setReport(response)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch cash flow report',
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'operating': return Building2
      case 'investing': return Package
      case 'financing': return Banknote
      default: return TrendingUp
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cash Flow Statement</h1>
            <p className="text-muted-foreground">Track cash movements by activity</p>
          </div>
        </div>
        {report && (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Operating Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${report.operating_activities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(report.operating_activities.total))}
                  </div>
                  {report.operating_activities.total >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Investing Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${report.investing_activities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(report.investing_activities.total))}
                  </div>
                  {report.investing_activities.total >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Financing Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${report.financing_activities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(report.financing_activities.total))}
                  </div>
                  {report.financing_activities.total >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${report.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(report.net_cash_flow)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.net_cash_flow >= 0 ? 'Cash increase' : 'Cash decrease'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Operating Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Operating Activities</CardTitle>
              </div>
              <CardDescription>Cash flows from core business operations</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList 
                transactions={report.operating_activities.transactions} 
                total={report.operating_activities.total} 
              />
            </CardContent>
          </Card>

          {/* Investing Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Investing Activities</CardTitle>
              </div>
              <CardDescription>Cash flows from asset purchases and sales</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList 
                transactions={report.investing_activities.transactions} 
                total={report.investing_activities.total} 
              />
            </CardContent>
          </Card>

          {/* Financing Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Financing Activities</CardTitle>
              </div>
              <CardDescription>Cash flows from loans and investments</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList 
                transactions={report.financing_activities.transactions} 
                total={report.financing_activities.total} 
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function TransactionList({ transactions, total }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions in this category
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => (
        <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
          <div className="flex-1">
            <p className="text-sm font-medium">{transaction.description}</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{format(new Date(transaction.date), 'PP')}</span>
              {transaction.contact_name && <span>{transaction.contact_name}</span>}
            </div>
          </div>
          <p className={`text-sm font-medium ${
            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
        </div>
      ))}
      
      <div className="flex justify-between items-center pt-4 border-t font-bold">
        <p>Total</p>
        <p className={total >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(Math.abs(total))}
        </p>
      </div>
    </div>
  )
}