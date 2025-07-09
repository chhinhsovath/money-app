import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ContactService from '@/services/ContactService'
import InvoiceService from '@/services/InvoiceService'
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
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Receipt,
  User,
  Building,
} from 'lucide-react'
import { format } from 'date-fns'

const typeColors = {
  customer: 'default',
  supplier: 'secondary',
  both: 'outline',
}

const typeLabels = {
  customer: 'Customer',
  supplier: 'Supplier',
  both: 'Customer & Supplier',
}

export default function ContactView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContactData()
  }, [id])

  const loadContactData = async () => {
    try {
      const [contactData, invoicesData] = await Promise.all([
        ContactService.getById(id),
        InvoiceService.getAll(),
      ])

      setContact(contactData)
      // Filter invoices for this contact
      setInvoices(invoicesData.filter(inv => inv.contact_id === parseInt(id)))
    } catch (error) {
      console.error('Error loading contact data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await ContactService.delete(id)
        navigate('/contacts')
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
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

  if (!contact) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Contact not found</h2>
          <Button onClick={() => navigate('/contacts')} className="mt-4">
            Back to Contacts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/contacts')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {contact.name}
              <Badge variant={typeColors[contact.type]}>
                {typeLabels[contact.type]}
              </Badge>
            </h1>
            {contact.contact_person && (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <User className="h-4 w-4" />
                {contact.contact_person}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link to={`/contacts/${id}/edit`}>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            {contact.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {contact.address}
                  </p>
                </div>
              </div>
            )}

            {contact.tax_number && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tax Number</p>
                  <p className="text-sm text-muted-foreground">
                    {contact.tax_number}
                  </p>
                </div>
              </div>
            )}

            {!contact.email && !contact.phone && !contact.address && !contact.tax_number && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No contact information available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contact.type !== 'supplier' && (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Invoiced</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(
                        invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {contact.type !== 'customer' && (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Bills</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(0)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">0 bills</p>
                </div>
              )}

              <div className="pt-4 border-t flex gap-2">
                {contact.type !== 'supplier' && (
                  <Link to={`/invoices/new?contact=${id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      New Invoice
                    </Button>
                  </Link>
                )}
                {contact.type !== 'customer' && (
                  <Link to={`/bills/new?contact=${id}`} className="flex-1">
                    <Button className="w-full" size="sm" variant="outline">
                      <Receipt className="mr-2 h-4 w-4" />
                      New Bill
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {contact.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {contact.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {contact.type !== 'supplier' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
                <p>No invoices yet</p>
                <Link to={`/invoices/new?contact=${id}`}>
                  <Button className="mt-4" size="sm">
                    Create First Invoice
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="hover:underline"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}