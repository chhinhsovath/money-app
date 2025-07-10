import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import ContactService from '@/services/ContactService'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  CreditCard, 
  Calendar,
  Globe,
  Edit,
  Trash2,
  Receipt,
  Plus,
  MoreHorizontal,
  Activity,
  DollarSign,
  FileText,
  Printer,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function VendorView() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [vendor, setVendor] = useState(null)
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [billsLoading, setBillsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadVendor()
    loadVendorBills()
  }, [id])

  const loadVendor = async () => {
    try {
      const data = await ContactService.getById(id)
      setVendor(data)
    } catch (error) {
      console.error('Error loading vendor:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vendor details',
        variant: 'destructive'
      })
      navigate('/vendors')
    } finally {
      setLoading(false)
    }
  }

  const loadVendorBills = async () => {
    try {
      const data = await BillService.getAll()
      // Filter bills for this vendor
      const vendorBills = data.filter(bill => bill.contact_id === id)
      setBills(vendorBills)
    } catch (error) {
      console.error('Error loading vendor bills:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vendor bills',
        variant: 'destructive'
      })
    } finally {
      setBillsLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await ContactService.delete(id)
      toast({
        title: 'Success',
        description: 'Vendor deleted successfully'
      })
      navigate('/vendors')
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete vendor',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const calculateBillsSummary = () => {
    const total = bills.reduce((sum, bill) => sum + (parseFloat(bill.total) || 0), 0)
    const pending = bills.filter(bill => bill.status === 'approved' || bill.status === 'draft').length
    const paid = bills.filter(bill => bill.status === 'paid').length
    const overdue = bills.filter(bill => {
      if (bill.status === 'paid') return false
      if (!bill.due_date) return false
      return new Date(bill.due_date) < new Date()
    }).length

    return { total, pending, paid, overdue }
  }

  const getBillStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'approved': return 'default'
      case 'paid': return 'default'
      case 'overdue': return 'destructive'
      default: return 'secondary'
    }
  }

  const getBillStatusIcon = (status) => {
    switch (status) {
      case 'draft': return FileText
      case 'approved': return Clock
      case 'paid': return CheckCircle
      case 'overdue': return XCircle
      default: return FileText
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Vendor not found</h2>
          <Button onClick={() => navigate('/vendors')} className="mt-4">
            Back to Vendors
          </Button>
        </div>
      </div>
    )
  }

  const billsSummary = calculateBillsSummary()

  return (
    <div className="p-6 print:p-0 print-container">
      <div className="mb-6 print:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate('/vendors')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {vendor.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Vendor Details
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/vendors/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Vendor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/bills/new?vendor=${id}`}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Create Bill
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Vendor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="print:block">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Vendor Details</h1>
          <p className="text-muted-foreground">{vendor.name}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6 page-break-inside-avoid">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{vendor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={vendor.is_active ? 'default' : 'secondary'} className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {vendor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {vendor.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <a href={`mailto:${vendor.email}`} className="font-medium hover:underline flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <a href={`tel:${vendor.phone}`} className="font-medium hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.contact_person && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Person:</span>
                  <span className="font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {vendor.contact_person}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.address && (
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <div className="font-medium mt-1">
                    <div>{vendor.address}</div>
                    {(vendor.city || vendor.state || vendor.postal_code) && (
                      <div>
                        {[vendor.city, vendor.state, vendor.postal_code].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {vendor.country && <div>{vendor.country}</div>}
                  </div>
                </div>
              )}
              {vendor.tax_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Number:</span>
                  <span className="font-medium">{vendor.tax_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Terms:</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {vendor.payment_terms ? `${vendor.payment_terms} days` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credit Limit:</span>
                <span className="font-medium flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {formatCurrency(vendor.credit_limit)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6 vendor-summary-cards">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bills</p>
                  <p className="text-2xl font-bold">{formatCurrency(billsSummary.total)}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Bills</p>
                  <p className="text-2xl font-bold">{billsSummary.pending}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid Bills</p>
                  <p className="text-2xl font-bold">{billsSummary.paid}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue Bills</p>
                  <p className="text-2xl font-bold">{billsSummary.overdue}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Bills
              </CardTitle>
              <div className="flex gap-2 print:hidden">
                <Link to={`/bills/new?vendor=${id}`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Bill
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {billsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : bills.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 mb-4 opacity-30" />
                <p className="text-muted-foreground">No bills found for this vendor</p>
                <p className="text-sm text-muted-foreground">Create your first bill to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="print:hidden w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.slice(0, 10).map((bill) => {
                    const StatusIcon = getBillStatusIcon(bill.status)
                    return (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/bills/${bill.id}`}
                            className="hover:underline"
                          >
                            {bill.bill_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {bill.issue_date ? format(new Date(bill.issue_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {bill.due_date ? format(new Date(bill.due_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBillStatusColor(bill.status)} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium currency">
                          {formatCurrency(bill.total)}
                        </TableCell>
                        <TableCell className="print:hidden">
                          <Link to={`/bills/${bill.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {vendor.name}? 
              This action cannot be undone and will affect all related bills and transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}