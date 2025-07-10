import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import BankTransactionService from '@/services/BankTransactionService'
import BankAccountService from '@/services/BankAccountService'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  DollarSign,
  Search,
  Filter,
  Download,
  FileDown,
  Receipt,
  Printer,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import * as XLSX from 'xlsx'

export default function TransactionList() {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [reconcileFilter, setReconcileFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [deleteTransaction, setDeleteTransaction] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [transactionsData, accountsData] = await Promise.all([
        BankTransactionService.getAll(),
        BankAccountService.getAll()
      ])
      setTransactions(transactionsData)
      setFilteredTransactions(transactionsData)
      setBankAccounts(accountsData)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTransaction) return

    try {
      await BankTransactionService.delete(deleteTransaction.id)
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully'
      })
      loadData()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive'
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteTransaction(null)
    }
  }

  const handleBulkReconcile = async (isReconciled) => {
    if (selectedTransactions.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select transactions to reconcile',
        variant: 'destructive'
      })
      return
    }

    try {
      await BankTransactionService.reconcile(selectedTransactions, isReconciled)
      toast({
        title: 'Success',
        description: `${selectedTransactions.length} transaction(s) ${isReconciled ? 'reconciled' : 'unreconciled'}`
      })
      setSelectedTransactions([])
      loadData()
    } catch (error) {
      console.error('Error reconciling transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to update transactions',
        variant: 'destructive'
      })
    }
  }

  const handleExportExcel = () => {
    const exportData = filteredTransactions.map(tx => ({
      'Date': tx.date ? format(new Date(tx.date), 'yyyy-MM-dd') : '',
      'Account': tx.account_name || '',
      'Type': tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      'Amount': tx.amount || 0,
      'Description': tx.description || '',
      'Reference': tx.reference || '',
      'Payee': tx.payee || '',
      'Contact': tx.contact_name || '',
      'Reconciled': tx.is_reconciled ? 'Yes' : 'No',
      'Created': tx.created_at ? format(new Date(tx.created_at), 'yyyy-MM-dd') : '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
    XLSX.writeFile(wb, `transactions_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    
    toast({
      title: 'Success',
      description: 'Transactions exported successfully'
    })
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Account', 'Type', 'Amount', 'Description', 'Reference', 'Payee', 'Contact', 'Reconciled', 'Created']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.date ? format(new Date(tx.date), 'yyyy-MM-dd') : '',
        `"${tx.account_name || ''}"`,
        tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
        tx.amount || 0,
        `"${tx.description || ''}"`,
        `"${tx.reference || ''}"`,
        `"${tx.payee || ''}"`,
        `"${tx.contact_name || ''}"`,
        tx.is_reconciled ? 'Yes' : 'No',
        tx.created_at ? format(new Date(tx.created_at), 'yyyy-MM-dd') : '',
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Transactions exported successfully'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  // Apply filters and sorting
  useEffect(() => {
    let filtered = transactions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.payee && tx.payee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.contact_name && tx.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(tx => tx.bank_account_id === accountFilter)
    }

    // Apply reconcile filter
    if (reconcileFilter !== 'all') {
      filtered = filtered.filter(tx => {
        if (reconcileFilter === 'reconciled') return tx.is_reconciled
        if (reconcileFilter === 'unreconciled') return !tx.is_reconciled
        return true
      })
    }

    // Apply date filters
    if (startDate) {
      filtered = filtered.filter(tx => new Date(tx.date) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter(tx => new Date(tx.date) <= new Date(endDate))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'date':
          aVal = new Date(a.date)
          bVal = new Date(b.date)
          break
        case 'amount':
          aVal = parseFloat(a.amount) || 0
          bVal = parseFloat(b.amount) || 0
          break
        case 'account':
          aVal = a.account_name || ''
          bVal = b.account_name || ''
          break
        default:
          aVal = a[sortField] || ''
          bVal = b[sortField] || ''
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, accountFilter, reconcileFilter, startDate, endDate, sortField, sortDirection])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTransactions(filteredTransactions.map(tx => tx.id))
    } else {
      setSelectedTransactions([])
    }
  }

  const handleSelectTransaction = (transactionId, checked) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, transactionId])
    } else {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId))
    }
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
            <DollarSign className="h-8 w-8" />
            Transactions
          </h1>
          <p className="text-muted-foreground">
            Manage all bank account transactions
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
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link to="/bank-transactions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-center">Bank Transactions</h1>
        <p className="text-center text-muted-foreground">
          Generated on {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-6 mb-6 print:hidden">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger>
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {bankAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={reconcileFilter} onValueChange={setReconcileFilter}>
          <SelectTrigger>
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reconciled">Reconciled</SelectItem>
            <SelectItem value="unreconciled">Unreconciled</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="mb-4 p-4 bg-muted rounded-lg print:hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedTransactions.length} transaction(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkReconcile(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Reconciled
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkReconcile(false)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Mark Unreconciled
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedTransactions([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="print:hidden w-[50px]">
                <Checkbox
                  checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">
                  Date {getSortIcon('date')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('account')}>
                <div className="flex items-center gap-1">
                  Account {getSortIcon('account')}
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-end gap-1">
                  Amount {getSortIcon('amount')}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Payee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="print:hidden w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <p>
                      {searchTerm || accountFilter !== 'all' || reconcileFilter !== 'all' || startDate || endDate
                        ? 'No transactions found matching your criteria'
                        : 'No transactions found'}
                    </p>
                    <p className="text-sm">
                      {searchTerm || accountFilter !== 'all' || reconcileFilter !== 'all' || startDate || endDate
                        ? 'Try adjusting your search or filters'
                        : 'Create your first transaction to get started'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="print:hidden">
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {transaction.date ? format(new Date(transaction.date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{transaction.account_name || 'Unknown Account'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'credit' ? 'success' : 'secondary'}>
                      {transaction.type === 'credit' ? 'Money In' : 'Money Out'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.description || '-'}
                  </TableCell>
                  <TableCell>{transaction.reference || '-'}</TableCell>
                  <TableCell>{transaction.payee || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.is_reconciled ? 'success' : 'secondary'} className="flex items-center gap-1 w-fit">
                      {transaction.is_reconciled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {transaction.is_reconciled ? 'Reconciled' : 'Unreconciled'}
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
                          <Link to={`/transactions/${transaction.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/transactions/${transaction.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleBulkReconcile(!transaction.is_reconciled)}
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
                          onClick={() => {
                            setDeleteTransaction(transaction)
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
        Showing {filteredTransactions.length} of {transactions.length} transactions
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}