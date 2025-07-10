import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import reportService from '@/services/ReportService'
import { useToast } from '@/components/ui/use-toast'

export default function BalanceSheetReport() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await reportService.getBalanceSheet(asOfDate)
      setReport(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch balance sheet',
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
            <h1 className="text-3xl font-bold">Balance Sheet</h1>
            <p className="text-muted-foreground">Financial position snapshot</p>
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
          <CardTitle>Report Date</CardTitle>
          <CardDescription>Select the date for your balance sheet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateReport} className="flex gap-4 items-end">
            <div className="grid gap-2">
              <Label htmlFor="as-of-date">As of Date</Label>
              <Input
                id="as-of-date"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
                <CardDescription>What the business owns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Assets */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Current Assets</h4>
                    <div className="space-y-2">
                      {report.assets.accounts
                        .filter(a => a.code.startsWith('1') && parseInt(a.code) < 1500)
                        .map((account) => (
                          <div key={account.code} className="flex justify-between items-center py-1">
                            <p className="text-sm">{account.code} - {account.name}</p>
                            <p className="text-sm font-medium">{formatCurrency(account.balance)}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Fixed Assets */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Fixed Assets</h4>
                    <div className="space-y-2">
                      {report.assets.accounts
                        .filter(a => parseInt(a.code) >= 1500)
                        .map((account) => (
                          <div key={account.code} className="flex justify-between items-center py-1">
                            <p className="text-sm">{account.code} - {account.name}</p>
                            <p className="text-sm font-medium">{formatCurrency(account.balance)}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold">
                      <p>Total Assets</p>
                      <p>{formatCurrency(report.assets.total)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liabilities & Equity Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liabilities</CardTitle>
                <CardDescription>What the business owes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Liabilities */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Current Liabilities</h4>
                    <div className="space-y-2">
                      {report.liabilities.accounts
                        .filter(a => a.code.startsWith('2') && parseInt(a.code) < 2500)
                        .map((account) => (
                          <div key={account.code} className="flex justify-between items-center py-1">
                            <p className="text-sm">{account.code} - {account.name}</p>
                            <p className="text-sm font-medium">{formatCurrency(account.balance)}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Long-term Liabilities */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Long-term Liabilities</h4>
                    <div className="space-y-2">
                      {report.liabilities.accounts
                        .filter(a => parseInt(a.code) >= 2500)
                        .map((account) => (
                          <div key={account.code} className="flex justify-between items-center py-1">
                            <p className="text-sm">{account.code} - {account.name}</p>
                            <p className="text-sm font-medium">{formatCurrency(account.balance)}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold">
                      <p>Total Liabilities</p>
                      <p>{formatCurrency(report.liabilities.total)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equity</CardTitle>
                <CardDescription>Owner's interest in the business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.equity.accounts.map((account) => (
                    <div key={account.code} className="flex justify-between items-center py-1">
                      <p className="text-sm">{account.code} - {account.name}</p>
                      <p className="text-sm font-medium">{formatCurrency(account.balance)}</p>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold">
                      <p>Total Equity</p>
                      <p>{formatCurrency(report.equity.total)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Check */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Total Assets</p>
                    <p className="font-medium">{formatCurrency(report.assets.total)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Total Liabilities + Equity</p>
                    <p className="font-medium">{formatCurrency(report.total_liabilities_and_equity)}</p>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <p className="font-bold">Balance</p>
                      <p className={`font-bold ${Math.abs(report.assets.total - report.total_liabilities_and_equity) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(report.assets.total - report.total_liabilities_and_equity)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}