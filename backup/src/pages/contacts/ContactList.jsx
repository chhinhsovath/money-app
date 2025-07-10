import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Users,
  Search,
  Mail,
  Phone,
} from 'lucide-react'

const typeColors = {
  customer: 'default',
  supplier: 'secondary',
  both: 'outline',
}

const typeLabels = {
  customer: 'Customer',
  supplier: 'Supplier',
  both: 'Both',
}

export default function ContactList() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const data = await ContactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await ContactService.delete(id)
        loadContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm)
    
    const matchesType = typeFilter === 'all' || contact.type === typeFilter

    return matchesSearch && matchesType
  })

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
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your customers and suppliers
          </p>
        </div>
        <Link to="/contacts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="supplier">Suppliers</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p>
                      {searchTerm || typeFilter !== 'all'
                        ? 'No contacts found matching your criteria'
                        : 'No contacts found'}
                    </p>
                    <p className="text-sm">
                      {searchTerm || typeFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Create your first contact to get started'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="hover:underline"
                    >
                      {contact.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeColors[contact.type]}>
                      {typeLabels[contact.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 hover:underline text-sm"
                      >
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 hover:underline text-sm"
                      >
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{contact.contact_person || '-'}</TableCell>
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
                          <Link to={`/contacts/${contact.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/contacts/${contact.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(contact.id)}
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
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>
    </div>
  )
}