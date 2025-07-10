import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import InvoiceService from '@/services/InvoiceService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Download,
  Edit,
  Mail,
  Printer,
  DollarSign,
  Calendar,
  Building,
  FileText,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const statusColors = {
  draft: 'secondary',
  sent: 'default',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
}

export default function InvoiceView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Check if print mode from query params
  const isPrintMode = new URLSearchParams(location.search).get('print') === 'true'

  useEffect(() => {
    loadInvoice()
  }, [id])

  useEffect(() => {
    if (isPrintMode && invoice) {
      setTimeout(() => {
        window.print()
        window.close()
      }, 500)
    }
  }, [isPrintMode, invoice])

  const loadInvoice = async () => {
    try {
      const data = await InvoiceService.getById(id)
      setInvoice(data)
    } catch (error) {
      console.error('Error loading invoice:', error)
      toast({
        title: 'Error',
        description: 'Failed to load invoice',
        variant: 'destructive'
      })
      navigate('/invoices')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF server-side
    toast({
      title: 'Coming Soon',
      description: 'PDF generation will be available soon',
    })
  }

  const handleSendEmail = () => {
    toast({
      title: 'Coming Soon',
      description: 'Email functionality will be available soon',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div className={`${isPrintMode ? '' : 'p-6'} invoice-view`}>
      {/* Hide controls in print mode */}
      {!isPrintMode && (
        <div className="flex justify-between items-center mb-6 no-print">
          <Button
            variant="ghost"
            onClick={() => navigate('/invoices')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button onClick={() => navigate(`/invoices/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      )}

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">INVOICE</CardTitle>
              <CardDescription className="text-lg mt-2">
                {invoice.invoice_number}
              </CardDescription>
            </div>
            <Badge variant={statusColors[invoice.status]} className="text-lg px-4 py-2">
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company and Customer Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Building className="mr-2 h-4 w-4" />
                From
              </h3>
              <p className="text-sm text-muted-foreground">
                Your Company Name<br />
                123 Business Street<br />
                City, State 12345<br />
                Email: info@company.com<br />
                Phone: (555) 123-4567
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Bill To
              </h3>
              <p className="text-sm text-muted-foreground">
                {invoice.contact_name || 'N/A'}<br />
                {invoice.contact_email || ''}<br />
                {invoice.contact_address || 'No address provided'}
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Issue Date
              </p>
              <p className="font-medium">
                {invoice.issue_date ? format(new Date(invoice.issue_date), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Due Date
              </p>
              <p className="font-medium">
                {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Reference
              </p>
              <p className="font-medium">{invoice.reference || '-'}</p>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  invoice.line_items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.tax_amount || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.line_total || (item.quantity * item.unit_price))}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No line items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.paid_amount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span>{formatCurrency(invoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Balance Due</span>
                    <span>{formatCurrency(invoice.total - invoice.paid_amount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-2 gap-6 pt-4 border-t">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .invoice-view {
            padding: 0 !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}