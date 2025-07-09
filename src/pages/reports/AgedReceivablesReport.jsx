import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import reportService from '@/services/ReportService'
import { useToast } from '@/components/ui/use-toast'

export default function AgedReceivablesReport() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await reportService.getAgedReceivables()
      setReport(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch aged receivables report',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const getAgingColor = (category) => {
    switch (category) {
      case 'current': return 'text-green-600'
      case '1-30': return 'text-yellow-600'
      case '31-60': return 'text-orange-600'
      case '61-90': return 'text-red-600'
      case 'over-90': return 'text-red-800'
      default: return ''
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
            <h1 className="text-3xl font-bold">Aged Receivables</h1>
            <p className="text-muted-foreground">Outstanding customer invoices by age</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReport} variant="outline" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {report && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Current</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.current.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.current.invoices.length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">1-30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(report.days_1_30.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.days_1_30.invoices.length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(report.days_31_60.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.days_31_60.invoices.length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(report.days_61_90.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.days_61_90.invoices.length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Over 90 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(report.over_90.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.over_90.invoices.length} invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Total Outstanding */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(report.total_outstanding)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed List */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>All outstanding invoices as of {format(new Date(report.as_of_date), 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current */}
                {report.current.invoices.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-600 mb-3">Current</h3>
                    <div className="space-y-2">
                      {report.current.invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} color="text-green-600" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-30 Days */}
                {report.days_1_30.invoices.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-yellow-600 mb-3">1-30 Days Overdue</h3>
                    <div className="space-y-2">
                      {report.days_1_30.invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} color="text-yellow-600" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 31-60 Days */}
                {report.days_31_60.invoices.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-orange-600 mb-3">31-60 Days Overdue</h3>
                    <div className="space-y-2">
                      {report.days_31_60.invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} color="text-orange-600" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 61-90 Days */}
                {report.days_61_90.invoices.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-600 mb-3">61-90 Days Overdue</h3>
                    <div className="space-y-2">
                      {report.days_61_90.invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} color="text-red-600" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Over 90 Days */}
                {report.over_90.invoices.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-800 mb-3">Over 90 Days Overdue</h3>
                    <div className="space-y-2">
                      {report.over_90.invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} color="text-red-800" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function InvoiceRow({ invoice, color }) {
  const navigate = useNavigate()
  
  return (
    <div className="flex justify-between items-center py-2 px-4 hover:bg-muted rounded-lg cursor-pointer"
         onClick={() => navigate(`/invoices/${invoice.id}`)}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{invoice.invoice_number}</p>
          {invoice.days_overdue > 30 && (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{invoice.contact_name}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${color}`}>
          {formatCurrency(invoice.total)}
        </p>
        <p className="text-xs text-muted-foreground">
          Due: {format(new Date(invoice.due_date), 'PP')}
        </p>
      </div>
    </div>
  )
}