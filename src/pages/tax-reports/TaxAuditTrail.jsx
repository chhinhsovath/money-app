import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileText, Receipt, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import TaxService from '@/services/TaxService'
import { useToast } from '@/components/ui/use-toast'
import { exportReport } from '@/utils/reportExport'

export default function TaxAuditTrail() {
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
      const response = await TaxService.getTaxAuditTrail(startDate, endDate)
      setReport(response)
    } catch (error) {
      console.error('Error fetching tax audit trail:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tax audit trail',
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
    
    const data = report.transactions.map(transaction => ({
      type: transaction.transaction_type,
      reference: transaction.reference,
      date: transaction.date,
      contact: transaction.contact_name,
      tax_name: transaction.tax_name,
      tax_rate: `${transaction.tax_rate}%`,
      tax_amount: transaction.tax_amount,
      status: transaction.status
    }))
    
    const columns = [
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'reference', label: 'Reference', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'contact', label: 'Contact', type: 'text' },
      { key: 'tax_name', label: 'Tax Name', type: 'text' },
      { key: 'tax_rate', label: 'Tax Rate', type: 'text' },
      { key: 'tax_amount', label: 'Tax Amount', type: 'currency', align: 'right' },
      { key: 'status', label: 'Status', type: 'text' }
    ]
    
    exportReport(
      format,
      data,
      columns,
      `Tax Audit Trail (${startDate} to ${endDate})`,
      `tax-audit-trail-${startDate}-${endDate}`
    )
  }

  const getTransactionIcon = (type) => {
    return type === 'invoice' ? Receipt : FileText
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'overdue': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <h1 className="text-3xl font-bold">Tax Audit Trail</h1>
          <p className="text-muted-foreground">Complete tax transaction history for compliance</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the date range for your audit trail</CardDescription>
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
              {loading ? 'Loading...' : 'Generate Trail'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Audit Trail Summary</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport('excel')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {report.period ? (
                  `${format(new Date(report.period.start_date), 'PPP')} - ${format(new Date(report.period.end_date), 'PPP')}`
                ) : (
                  'All time'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.total_transactions}</div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {report.transactions.filter(t => t.transaction_type === 'invoice').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Invoice Transactions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.transactions.filter(t => t.transaction_type === 'bill').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Bill Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Transactions</CardTitle>
              <CardDescription>All transactions with tax implications</CardDescription>
            </CardHeader>
            <CardContent>
              {report.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No tax transactions found</h3>
                  <p className="mt-2 text-muted-foreground">
                    No transactions with tax implications were found for the selected period.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.transactions.map((transaction, index) => {
                    const Icon = getTransactionIcon(transaction.transaction_type)
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{transaction.reference}</p>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {transaction.transaction_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {transaction.contact_name} • {format(new Date(transaction.date), 'PPP')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">{transaction.tax_name}</p>
                              <p className="text-sm font-medium">{transaction.tax_rate}% rate</p>
                            </div>
                            <div>
                              <p className="font-medium">
                                {formatCurrency(transaction.tax_amount)}
                              </p>
                              <p className="text-sm text-muted-foreground">Tax Amount</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/${transaction.transaction_type}s/${transaction.transaction_id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}