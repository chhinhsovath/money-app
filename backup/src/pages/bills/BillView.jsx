import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import BillService from '@/services/BillService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Edit,
  Trash,
  Receipt,
  Building,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
} from 'lucide-react'

const statusColors = {
  draft: 'secondary',
  approved: 'default',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'outline',
}

const statusLabels = {
  draft: 'Draft',
  approved: 'Approved',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

const statusIcons = {
  draft: Clock,
  approved: CheckCircle,
  paid: CheckCircle,
  overdue: AlertCircle,
  cancelled: XCircle,
}

export default function BillView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBill()
  }, [id])

  const loadBill = async () => {
    try {
      const data = await BillService.getById(id)
      setBill(data)
    } catch (error) {
      console.error('Error loading bill:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await BillService.delete(id)
        navigate('/bills')
      } catch (error) {
        console.error('Error deleting bill:', error)
      }
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await BillService.update(id, { ...bill, status: newStatus })
      loadBill()
    } catch (error) {
      console.error('Error updating bill status:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const calculateSubtotal = () => {
    return bill?.line_items?.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unit_price))
    }, 0) || 0
  }

  const calculateTax = () => {
    return bill?.line_items?.reduce((sum, item) => {
      return sum + (parseFloat(item.tax_amount) || 0)
    }, 0) || 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const isOverdue = () => {
    return bill?.status !== 'paid' && 
           bill?.status !== 'cancelled' && 
           new Date(bill?.due_date) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Bill not found</h2>
          <Button onClick={() => navigate('/bills')} className="mt-4">
            Back to Bills
          </Button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[isOverdue() ? 'overdue' : bill.status]

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/bills')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bills
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Receipt className="h-8 w-8" />
              Bill {bill.bill_number}
              <Badge 
                variant={statusColors[isOverdue() ? 'overdue' : bill.status]}
                className="flex items-center gap-1"
              >
                <StatusIcon className="h-4 w-4" />
                {isOverdue() ? 'Overdue' : statusLabels[bill.status]}
              </Badge>
            </h1>
            {bill.reference && (
              <p className="text-muted-foreground mt-1">
                Supplier Invoice: {bill.reference}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {bill.status === 'draft' && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('approved')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            {bill.status === 'approved' && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('paid')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
            )}
            <Link to={`/bills/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{bill.contact_name || 'N/A'}</p>
            {bill.contact_email && (
              <p className="text-sm text-muted-foreground">{bill.contact_email}</p>
            )}
            {bill.contact_phone && (
              <p className="text-sm text-muted-foreground">{bill.contact_phone}</p>
            )}
            {bill.contact_address && (
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                {bill.contact_address}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Bill Date</p>
              <p className="font-medium">
                {format(new Date(bill.bill_date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {format(new Date(bill.due_date), 'MMMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.line_items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    {item.account_code ? `${item.account_code} - ${item.account_name}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.tax_amount || 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(parseFloat(item.quantity) * parseFloat(item.unit_price))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {bill.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {bill.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}