import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, AlertTriangle, Calendar, DollarSign, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import TaxService from '@/services/TaxService'
import { useToast } from '@/components/ui/use-toast'

export default function TaxLiabilityReport() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await TaxService.getTaxLiability()
      setReport(response)
    } catch (error) {
      console.error('Error fetching tax liability report:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tax liability report',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null
    return differenceInDays(new Date(dueDate), new Date())
  }

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue === null) return 'text-muted-foreground'
    if (daysUntilDue < 0) return 'text-red-600'
    if (daysUntilDue <= 7) return 'text-orange-600'
    if (daysUntilDue <= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUrgencyBadge = (daysUntilDue) => {
    if (daysUntilDue === null) return { variant: 'secondary', text: 'No due date' }
    if (daysUntilDue < 0) return { variant: 'destructive', text: 'Overdue' }
    if (daysUntilDue === 0) return { variant: 'destructive', text: 'Due today' }
    if (daysUntilDue <= 7) return { variant: 'destructive', text: 'Due soon' }
    if (daysUntilDue <= 30) return { variant: 'default', text: 'Due this month' }
    return { variant: 'secondary', text: 'Due later' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/tax-reports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tax Liability</h1>
            <p className="text-muted-foreground">Current tax obligations and due dates</p>
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
          {/* Summary Card */}
          <Card className={`border-l-4 ${report.total_liability > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Total Tax Liability
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    <span className={report.total_liability >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(Math.abs(report.total_liability))}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.total_liability >= 0 ? 'Amount owed' : 'Credit available'}
                  </p>
                </div>
              </CardTitle>
              <CardDescription>
                Current period: {report.current_period}
                {report.next_filing_date && (
                  <span className="ml-4">
                    Next filing: {format(new Date(report.next_filing_date), 'PPP')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Individual Liabilities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tax Obligations</h2>
            
            {report.liabilities.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No tax liabilities</h3>
                    <p className="mt-2 text-muted-foreground">
                      You have no outstanding tax obligations for the current period.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {report.liabilities.map((liability, index) => {
                  const daysUntilDue = getDaysUntilDue(liability.due_date)
                  const urgencyColor = getUrgencyColor(daysUntilDue)
                  const urgencyBadge = getUrgencyBadge(daysUntilDue)
                  
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {liability.tax_type}
                              <Badge variant={urgencyBadge.variant}>
                                {urgencyBadge.text}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {liability.frequency} filing
                              </span>
                              {liability.due_date && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Due: {format(new Date(liability.due_date), 'PPP')}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              <span className={liability.amount >= 0 ? 'text-red-600' : 'text-green-600'}>
                                {formatCurrency(Math.abs(liability.amount))}
                              </span>
                            </div>
                            {daysUntilDue !== null && (
                              <p className={`text-sm font-medium ${urgencyColor}`}>
                                {daysUntilDue < 0 
                                  ? `${Math.abs(daysUntilDue)} days overdue`
                                  : daysUntilDue === 0 
                                    ? 'Due today'
                                    : `${daysUntilDue} days remaining`
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          {liability.amount > 0 && (
                            <>
                              <Button size="sm">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Pay Now
                              </Button>
                              <Button variant="outline" size="sm">
                                Schedule Payment
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Payment History / Upcoming Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tax-related actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Make Tax Payment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Filing Reminder
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download Tax Forms
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>How to pay your taxes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><strong>Online:</strong> Use your tax authority's online portal</p>
                  <p><strong>Bank Transfer:</strong> Direct payment to tax office</p>
                  <p><strong>In Person:</strong> Visit your local tax office</p>
                  <p className="text-muted-foreground">
                    Always keep receipts and confirmation numbers for your records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}