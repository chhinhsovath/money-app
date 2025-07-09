import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import BillService from '@/services/BillService'
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
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
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

export default function BillList() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBills()
  }, [])

  const loadBills = async () => {
    try {
      const data = await BillService.getAll()
      setBills(data)
    } catch (error) {
      console.error('Error loading bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await BillService.delete(id)
        loadBills()
      } catch (error) {
        console.error('Error deleting bill:', error)
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const isOverdue = (bill) => {
    return bill.status !== 'paid' && 
           bill.status !== 'cancelled' && 
           new Date(bill.due_date) < new Date()
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
          <h1 className="text-3xl font-bold">Bills</h1>
          <p className="text-muted-foreground">
            Manage your purchase bills and expenses
          </p>
        </div>
        <Link to="/bills/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  bills
                    .filter(b => b.status !== 'paid' && b.status !== 'cancelled')
                    .reduce((sum, b) => sum + parseFloat(b.total || 0), 0)
                )}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive">
                {bills.filter(isOverdue).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Awaiting Approval</p>
              <p className="text-2xl font-bold">
                {bills.filter(b => b.status === 'draft').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Paid This Month</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  bills
                    .filter(b => {
                      const paidThisMonth = b.status === 'paid' && 
                        new Date(b.updated_at).getMonth() === new Date().getMonth()
                      return paidThisMonth
                    })
                    .reduce((sum, b) => sum + parseFloat(b.total || 0), 0)
                )}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Receipt className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p>No bills found</p>
                    <p className="text-sm">
                      Create your first bill to track expenses
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => {
                const StatusIcon = statusIcons[isOverdue(bill) ? 'overdue' : bill.status]
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
                    <TableCell>{bill.contact_name || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(bill.bill_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(bill.due_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusColors[isOverdue(bill) ? 'overdue' : bill.status]}
                        className="flex items-center gap-1 w-fit"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {isOverdue(bill) ? 'Overdue' : statusLabels[bill.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(bill.total)}
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
                            <Link to={`/bills/${bill.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/bills/${bill.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {bill.status === 'draft' && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {bill.status === 'approved' && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(bill.id)}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}