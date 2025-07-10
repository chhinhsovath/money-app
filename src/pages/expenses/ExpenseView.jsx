import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import ExpenseService from '@/services/ExpenseService'
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
  Edit, 
  Trash2, 
  Send,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Receipt,
  Calendar,
  User,
  FileText,
  DollarSign,
  Printer,
  Download,
  Clock
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

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

export default function ExpenseView() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadExpense()
  }, [id])

  const loadExpense = async () => {
    try {
      const data = await ExpenseService.getById(id)
      setExpense(data)
    } catch (error) {
      console.error('Error loading expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to load expense claim',
        variant: 'destructive'
      })
      navigate('/expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await ExpenseService.delete(id)
      toast({
        title: 'Success',
        description: 'Expense claim deleted successfully'
      })
      navigate('/expenses')
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete expense claim',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleSubmit = async () => {
    setActionLoading(true)
    try {
      await ExpenseService.submit(id)
      toast({
        title: 'Success',
        description: 'Expense claim submitted for approval'
      })
      loadExpense()
    } catch (error) {
      console.error('Error submitting expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit expense claim',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await ExpenseService.approve(id)
      toast({
        title: 'Success',
        description: 'Expense claim approved'
      })
      loadExpense()
    } catch (error) {
      console.error('Error approving expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve expense claim',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      await ExpenseService.reject(id)
      toast({
        title: 'Success',
        description: 'Expense claim rejected'
      })
      loadExpense()
    } catch (error) {
      console.error('Error rejecting expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject expense claim',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Expense claim not found</h2>
          <Button onClick={() => navigate('/expenses')} className="mt-4">
            Back to Expenses
          </Button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[expense.status]

  return (
    <div className="p-6 print:p-0">
      <div className="mb-6 print:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate('/expenses')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Expenses
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Expense Claim Details</h1>
            <p className="text-muted-foreground mt-1">
              {expense.claim_number}
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
                {expense.status === 'draft' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to={`/expenses/${id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSubmit} disabled={actionLoading}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Approval
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {expense.status === 'submitted' && (
                  <>
                    <DropdownMenuItem onClick={handleApprove} disabled={actionLoading}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReject} disabled={actionLoading}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="print:block">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Expense Claim</h1>
          <p className="text-muted-foreground">{expense.claim_number}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Claim Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claim Number:</span>
                <span className="font-medium">{expense.claim_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={statusColors[expense.status]} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium text-lg">
                  {formatCurrency(expense.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee:</span>
                <span className="font-medium">{expense.employee_name || 'Self'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {expense.created_at ? format(new Date(expense.created_at), 'MMM d, yyyy') : '-'}
                </span>
              </div>
              {expense.updated_at && expense.updated_at !== expense.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">
                    {format(new Date(expense.updated_at), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {expense.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{expense.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Expense Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expense.line_items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {item.date ? format(new Date(item.date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {item.account_name ? (
                        <span className="text-sm">
                          {item.account_code && (
                            <span className="text-muted-foreground">{item.account_code} - </span>
                          )}
                          {item.account_name}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(expense.total_amount)}
                </TableCell>
              </TableRow>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete expense claim {expense.claim_number}? 
              This action cannot be undone.
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