import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import InvoiceService from '@/services/InvoiceService'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  FileText,
  Send,
  Download,
  Printer,
  FileDown,
  Search,
  Filter,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'

const statusColors = {
  draft: 'secondary',
  sent: 'default',
  paid: 'default',
  overdue: 'destructive',
  cancelled: 'outline',
}

const statusLabels = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      const data = await InvoiceService.getAll()
      setInvoices(data)
      setFilteredInvoices(data)
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await InvoiceService.delete(id)
        toast({
          title: 'Success',
          description: 'Invoice deleted successfully'
        })
        loadInvoices()
      } catch (error) {
        console.error('Error deleting invoice:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete invoice',
          variant: 'destructive'
        })
      }
    }
  }

  const handleExportExcel = () => {
    const exportData = filteredInvoices.map(inv => ({
      'Invoice Number': inv.invoice_number,
      'Customer': inv.contact_name || '-',
      'Issue Date': inv.issue_date ? format(new Date(inv.issue_date), 'yyyy-MM-dd') : '-',
      'Due Date': inv.due_date ? format(new Date(inv.due_date), 'yyyy-MM-dd') : '-',
      'Status': statusLabels[inv.status],
      'Amount': inv.total || 0,
      'Paid Amount': inv.paid_amount || 0,
      'Balance': (inv.total || 0) - (inv.paid_amount || 0)
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices')
    XLSX.writeFile(wb, `invoices_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    
    toast({
      title: 'Success',
      description: 'Invoices exported successfully'
    })
  }

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Customer', 'Issue Date', 'Due Date', 'Status', 'Amount', 'Paid Amount', 'Balance']
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(inv => [
        inv.invoice_number,
        `"${inv.contact_name || '-'}"`,
        inv.issue_date ? format(new Date(inv.issue_date), 'yyyy-MM-dd') : '-',
        inv.due_date ? format(new Date(inv.due_date), 'yyyy-MM-dd') : '-',
        statusLabels[inv.status],
        inv.total || 0,
        inv.paid_amount || 0,
        (inv.total || 0) - (inv.paid_amount || 0)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Invoices exported successfully'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePrintInvoice = (invoice) => {
    // Open invoice view in new window for printing
    window.open(`/invoices/${invoice.id}?print=true`, '_blank')
  }

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.contact_name && inv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }, [invoices, searchTerm, statusFilter])

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your sales invoices and payments
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print List
          </Button>
          <Link to="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p>No invoices found</p>
                    <p className="text-sm">
                      Create your first invoice to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="hover:underline"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.contact_name || '-'}</TableCell>
                  <TableCell>
                    {invoice.issue_date ? format(new Date(invoice.issue_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/invoices/${invoice.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/invoices/${invoice.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(invoice.id)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}