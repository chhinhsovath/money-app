import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, Receipt, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import TaxService from '@/services/TaxService'
import { useToast } from '@/components/ui/use-toast'
import { exportReport } from '@/utils/reportExport'

export default function SalesTaxReport() {
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
      const response = await TaxService.getSalesTaxReport(startDate, endDate)
      setReport(response)
    } catch (error) {
      console.error('Error fetching sales tax report:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch sales tax report',
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
    
    // Prepare sales tax data
    const salesTaxData = report.sales_tax.items.map(item => ({
      type: 'Sales Tax',
      tax_name: item.tax_name,
      tax_rate: `${item.tax_rate}%`,
      amount: item.tax_collected,
      transaction_count: item.invoice_count
    }))
    
    // Prepare purchase tax data
    const purchaseTaxData = report.purchase_tax.items.map(item => ({
      type: 'Purchase Tax',
      tax_name: item.tax_name,
      tax_rate: `${item.tax_rate}%`,
      amount: item.tax_paid,
      transaction_count: item.bill_count
    }))
    
    const allData = [...salesTaxData, ...purchaseTaxData]
    
    const columns = [
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'tax_name', label: 'Tax Name', type: 'text' },
      { key: 'tax_rate', label: 'Tax Rate', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
      { key: 'transaction_count', label: 'Transactions', type: 'number', align: 'right' }
    ]
    
    exportReport(
      format,
      allData,
      columns,
      `Sales Tax Report (${startDate} to ${endDate})`,
      `sales-tax-${startDate}-${endDate}`
    )
  }

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
          <h1 className="text-3xl font-bold">Sales Tax Report</h1>
          <p className="text-muted-foreground">VAT/GST collected vs paid analysis</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(report.summary.tax_collected)}
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tax Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(report.summary.tax_paid)}
                  </div>
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Net Tax Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={report.summary.net_liability >= 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(Math.abs(report.summary.net_liability))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.summary.net_liability >= 0 ? 'Amount owed' : 'Credit available'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleExport('excel')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Tax Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Sales Tax Collected
              </CardTitle>
              <CardDescription>Tax collected from customer invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.sales_tax.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.tax_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.tax_rate}% rate • {item.invoice_count} invoices
                      </p>
                    </div>
                    <p className="font-medium text-green-600">
                      {formatCurrency(item.tax_collected)}
                    </p>
                  </div>
                ))}
                {report.sales_tax.items.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No sales tax collected</p>
                )}
                <div className="flex justify-between items-center pt-4 font-bold">
                  <p>Total Sales Tax Collected</p>
                  <p className="text-green-600">{formatCurrency(report.sales_tax.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Tax Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Purchase Tax Paid
              </CardTitle>
              <CardDescription>Tax paid on supplier bills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.purchase_tax.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.tax_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.tax_rate}% rate • {item.bill_count} bills
                      </p>
                    </div>
                    <p className="font-medium text-blue-600">
                      {formatCurrency(item.tax_paid)}
                    </p>
                  </div>
                ))}
                {report.purchase_tax.items.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No purchase tax paid</p>
                )}
                <div className="flex justify-between items-center pt-4 font-bold">
                  <p>Total Purchase Tax Paid</p>
                  <p className="text-blue-600">{formatCurrency(report.purchase_tax.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}