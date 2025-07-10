import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import BankTransactionService from '@/services/BankTransactionService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DollarSign, 
  Building2, 
  Calendar,
  FileText,
  User,
  Hash,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Printer,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function TransactionView() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTransaction()
  }, [id])

  const loadTransaction = async () => {
    try {
      const data = await BankTransactionService.getById(id)
      setTransaction(data)
    } catch (error) {
      console.error('Error loading transaction:', error)
      toast({
        title: 'Error',
        description: 'Failed to load transaction details',
        variant: 'destructive'
      })
      navigate('/transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await BankTransactionService.delete(id)
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully'
      })
      navigate('/transactions')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleReconcile = async (isReconciled) => {
    setActionLoading(true)
    try {
      await BankTransactionService.reconcile([id], isReconciled)
      toast({
        title: 'Success',
        description: `Transaction ${isReconciled ? 'reconciled' : 'unreconciled'} successfully`
      })
      loadTransaction()
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
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

  if (!transaction) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Transaction not found</h2>
          <Button onClick={() => navigate('/transactions')} className="mt-4">
            Back to Transactions
          </Button>
        </div>
      </div>
    )
  }

  const TransactionIcon = transaction.type === 'credit' ? TrendingUp : TrendingDown
  const amountColor = transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'

  return (
    <div className="p-6 print:p-0">
      <div className="mb-6 print:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate('/transactions')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8" />
              Transaction Details
            </h1>
            <p className="text-muted-foreground mt-1">
              {transaction.reference || 'Transaction Details'}
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
                  <Link to={`/transactions/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Transaction
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleReconcile(!transaction.is_reconciled)}
                  disabled={actionLoading}
                >
                  {transaction.is_reconciled ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Mark Unreconciled
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Reconciled
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Transaction
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="print:block">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Transaction Details</h1>
          <p className="text-muted-foreground">
            {transaction.reference || format(new Date(transaction.date), 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TransactionIcon className={`h-5 w-5 ${amountColor}`} />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant={transaction.type === 'credit' ? 'success' : 'secondary'} className="flex items-center gap-1">
                  <TransactionIcon className="h-3 w-3" />
                  {transaction.type === 'credit' ? 'Money In' : 'Money Out'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className={`font-bold text-xl ${amountColor}`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {transaction.date ? format(new Date(transaction.date), 'MMMM d, yyyy') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={transaction.is_reconciled ? 'success' : 'secondary'} className="flex items-center gap-1">
                  {transaction.is_reconciled ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {transaction.is_reconciled ? 'Reconciled' : 'Unreconciled'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Account & Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Account:</span>
                <div className="text-right">
                  <div className="font-medium">{transaction.account_name || 'Unknown Account'}</div>
                  {transaction.account_code && (
                    <div className="text-sm text-muted-foreground">Code: {transaction.account_code}</div>
                  )}
                </div>
              </div>
              {transaction.contact_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {transaction.contact_name}
                  </span>
                </div>
              )}
              {transaction.payee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payee/Payer:</span>
                  <span className="font-medium">{transaction.payee}</span>
                </div>
              )}
              {transaction.reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {transaction.reference}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description & Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="mt-1 whitespace-pre-wrap">
                  {transaction.description || 'No description provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">Transaction Created</p>
                  <p className="text-sm text-muted-foreground">Initial transaction entry</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {transaction.created_at ? format(new Date(transaction.created_at), 'MMM d, yyyy') : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.created_at ? format(new Date(transaction.created_at), 'h:mm a') : '-'}
                  </p>
                </div>
              </div>
              
              {transaction.updated_at && transaction.updated_at !== transaction.created_at && (
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Transaction Updated</p>
                    <p className="text-sm text-muted-foreground">Last modification</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(transaction.updated_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.updated_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.is_reconciled ? 'Reconciled with bank statement' : 'Pending reconciliation'}
                  </p>
                </div>
                <Badge variant={transaction.is_reconciled ? 'success' : 'secondary'} className="flex items-center gap-1">
                  {transaction.is_reconciled ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {transaction.is_reconciled ? 'Reconciled' : 'Unreconciled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? 
              This action cannot be undone and will affect your account balance.
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