import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ContactService from '@/services/ContactService'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Building2,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Download,
  FileDown,
  Receipt,
  Printer,
  DollarSign,
  Calendar,
  Activity,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'

export default function VendorList() {
  const [vendors, setVendors] = useState([])
  const [filteredVendors, setFilteredVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteVendor, setDeleteVendor] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const data = await ContactService.getAll()
      // Filter only suppliers
      const suppliers = data.filter(contact => contact.type === 'supplier' || contact.type === 'both')
      setVendors(suppliers)
      setFilteredVendors(suppliers)
    } catch (error) {
      console.error('Error loading vendors:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vendors',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteVendor) return

    try {
      await ContactService.delete(deleteVendor.id)
      toast({
        title: 'Success',
        description: 'Vendor deleted successfully'
      })
      loadVendors()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete vendor',
        variant: 'destructive'
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteVendor(null)
    }
  }

  const handleExportExcel = () => {
    const exportData = filteredVendors.map(vendor => ({
      'Vendor Name': vendor.name,
      'Email': vendor.email || '',
      'Phone': vendor.phone || '',
      'Contact Person': vendor.contact_person || '',
      'Address': vendor.address || '',
      'City': vendor.city || '',
      'State': vendor.state || '',
      'Postal Code': vendor.postal_code || '',
      'Country': vendor.country || '',
      'Payment Terms': vendor.payment_terms || '',
      'Credit Limit': vendor.credit_limit || '',
      'Status': vendor.is_active ? 'Active' : 'Inactive',
      'Created Date': vendor.created_at ? format(new Date(vendor.created_at), 'yyyy-MM-dd') : '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vendors')
    XLSX.writeFile(wb, `vendors_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    
    toast({
      title: 'Success',
      description: 'Vendors exported successfully'
    })
  }

  const handleExportCSV = () => {
    const headers = ['Vendor Name', 'Email', 'Phone', 'Contact Person', 'Address', 'City', 'State', 'Postal Code', 'Country', 'Payment Terms', 'Credit Limit', 'Status', 'Created Date']
    const csvContent = [
      headers.join(','),
      ...filteredVendors.map(vendor => [
        `"${vendor.name}"`,
        `"${vendor.email || ''}"`,
        `"${vendor.phone || ''}"`,
        `"${vendor.contact_person || ''}"`,
        `"${vendor.address || ''}"`,
        `"${vendor.city || ''}"`,
        `"${vendor.state || ''}"`,
        `"${vendor.postal_code || ''}"`,
        `"${vendor.country || ''}"`,
        vendor.payment_terms || '',
        vendor.credit_limit || '',
        vendor.is_active ? 'Active' : 'Inactive',
        vendor.created_at ? format(new Date(vendor.created_at), 'yyyy-MM-dd') : '',
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendors_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Vendors exported successfully'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter vendors based on search and status
  useEffect(() => {
    let filtered = vendors

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vendor.phone && vendor.phone.includes(searchTerm)) ||
        (vendor.contact_person && vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => {
        if (statusFilter === 'active') return vendor.is_active
        if (statusFilter === 'inactive') return !vendor.is_active
        return true
      })
    }

    setFilteredVendors(filtered)
  }, [vendors, searchTerm, statusFilter])

  const formatCurrency = (amount) => {
    return amount ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount) : '-'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Vendors
          </h1>
          <p className="text-muted-foreground">
            Manage your suppliers and service providers
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
                <Receipt className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print List
          </Button>
          <Link to="/vendors/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Vendor
            </Button>
          </Link>
        </div>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-center">Vendor List</h1>
        <p className="text-center text-muted-foreground">
          Generated on {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      <div className="flex gap-4 mb-6 print:hidden">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search vendors..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Credit Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="print:hidden w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Building2 className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p>
                      {searchTerm || statusFilter !== 'all'
                        ? 'No vendors found matching your criteria'
                        : 'No vendors found'}
                    </p>
                    <p className="text-sm">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Create your first vendor to get started'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/vendors/${vendor.id}`}
                      className="hover:underline flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {vendor.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {vendor.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <a href={`mailto:${vendor.email}`} className="hover:underline">
                            {vendor.email}
                          </a>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <a href={`tel:${vendor.phone}`} className="hover:underline">
                            {vendor.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{vendor.contact_person || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {vendor.address ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                          <div>
                            <div>{vendor.address}</div>
                            {(vendor.city || vendor.state || vendor.postal_code) && (
                              <div className="text-muted-foreground">
                                {[vendor.city, vendor.state, vendor.postal_code].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {vendor.payment_terms ? `${vendor.payment_terms} days` : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {formatCurrency(vendor.credit_limit)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={vendor.is_active ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                      <Activity className="h-3 w-3" />
                      {vendor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="print:hidden">
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
                          <Link to={`/vendors/${vendor.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/vendors/${vendor.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/bills/new?vendor=${vendor.id}`}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Create Bill
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteVendor(vendor)
                            setShowDeleteDialog(true)
                          }}
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

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredVendors.length} of {vendors.length} vendors
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteVendor?.name}? 
              This action cannot be undone and will affect all related bills and transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}