import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ExpenseService from '@/services/ExpenseService'
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
  Receipt,
  Send,
  Download,
  Printer,
  FileDown,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'

const statusColors = {
  draft: 'secondary',
  submitted: 'default',
  approved: 'success',
  paid: 'success',
  rejected: 'destructive',
}

const statusIcons = {
  draft: Receipt,
  submitted: Clock,
  approved: CheckCircle,
  paid: DollarSign,
  rejected: XCircle,
}

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteExpense, setDeleteExpense] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const data = await ExpenseService.getAll()
      setExpenses(data)
      setFilteredExpenses(data)
    } catch (error) {
      console.error('Error loading expenses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load expense claims',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteExpense) return

    try {
      await ExpenseService.delete(deleteExpense.id)
      toast({
        title: 'Success',
        description: 'Expense claim deleted successfully'
      })
      loadExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete expense claim',
        variant: 'destructive'
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteExpense(null)
    }
  }

  const handleSubmit = async (expense) => {
    try {
      await ExpenseService.submit(expense.id)
      toast({
        title: 'Success',
        description: 'Expense claim submitted for approval'
      })
      loadExpenses()
    } catch (error) {
      console.error('Error submitting expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit expense claim',
        variant: 'destructive'
      })
    }
  }

  const handleExportExcel = () => {
    const exportData = filteredExpenses.map(exp => ({
      'Claim Number': exp.claim_number,
      'Employee': exp.employee_name || 'Self',
      'Date': exp.date ? format(new Date(exp.date), 'yyyy-MM-dd') : '-',
      'Status': exp.status.charAt(0).toUpperCase() + exp.status.slice(1),
      'Amount': exp.total_amount || 0,
      'Notes': exp.notes || ''
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
    XLSX.writeFile(wb, `expenses_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    
    toast({
      title: 'Success',
      description: 'Expenses exported successfully'
    })
  }

  const handleExportCSV = () => {
    const headers = ['Claim Number', 'Employee', 'Date', 'Status', 'Amount', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(exp => [
        exp.claim_number,
        `"${exp.employee_name || 'Self'}"`,
        exp.date ? format(new Date(exp.date), 'yyyy-MM-dd') : '-',
        exp.status.charAt(0).toUpperCase() + exp.status.slice(1),
        exp.total_amount || 0,
        `"${exp.notes || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Expenses exported successfully'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter expenses based on search and status
  useEffect(() => {
    let filtered = expenses

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exp => 
        exp.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.employee_name && exp.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(exp => exp.status === statusFilter)
    }

    setFilteredExpenses(filtered)
  }, [expenses, searchTerm, statusFilter])

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
          <h1 className="text-3xl font-bold">Expense Claims</h1>
          <p className="text-muted-foreground">
            Manage employee expense claims and reimbursements
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
          <Link to="/expenses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Expense Claim
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search expense claims..."
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
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim #</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Receipt className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p>No expense claims found</p>
                    <p className="text-sm">
                      Create your first expense claim to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => {
                const StatusIcon = statusIcons[expense.status]
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="hover:underline"
                      >
                        {expense.claim_number}
                      </Link>
                    </TableCell>
                    <TableCell>{expense.employee_name || 'Self'}</TableCell>
                    <TableCell>
                      {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[expense.status]} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(expense.total_amount)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.notes || '-'}
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
                            <Link to={`/expenses/${expense.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          {expense.status === 'draft' && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link to={`/expenses/${expense.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSubmit(expense)}>
                                <Send className="mr-2 h-4 w-4" />
                                Submit for Approval
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteExpense(expense)
                                  setShowDeleteDialog(true)
                                }}
                                className="text-destructive"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete expense claim {deleteExpense?.claim_number}? 
              This action cannot be undone.
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