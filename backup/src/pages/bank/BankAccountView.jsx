import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import BankAccountService from '@/services/BankAccountService'
import BankTransactionService from '@/services/BankTransactionService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Edit,
  Plus,
  Search,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from 'lucide-react'

export default function BankAccountView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterReconciled, setFilterReconciled] = useState('all')
  const [selectedTransactions, setSelectedTransactions] = useState([])

  useEffect(() => {
    loadAccountData()
  }, [id])

  const loadAccountData = async () => {
    try {
      const accountData = await BankAccountService.getById(id)
      setAccount(accountData)
      setTransactions(accountData.transactions || [])
    } catch (error) {
      console.error('Error loading account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReconcileToggle = async (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) return

    try {
      await BankTransactionService.update(transactionId, {
        ...transaction,
        is_reconciled: !transaction.is_reconciled
      })
      loadAccountData()
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  const handleBulkReconcile = async (reconciled) => {
    if (selectedTransactions.length === 0) return

    try {
      await BankTransactionService.reconcile(selectedTransactions, reconciled)
      setSelectedTransactions([])
      loadAccountData()
    } catch (error) {
      console.error('Error reconciling transactions:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.payee?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesReconciled = 
        filterReconciled === 'all' ||
        (filterReconciled === 'reconciled' && transaction.is_reconciled) ||
        (filterReconciled === 'unreconciled' && !transaction.is_reconciled)

      return matchesSearch && matchesReconciled
    })
  }

  const calculateRunningBalance = (transactions) => {
    let balance = 0
    return transactions.map(transaction => {
      if (transaction.type === 'credit') {
        balance += parseFloat(transaction.amount)
      } else {
        balance -= parseFloat(transaction.amount)
      }
      return { ...transaction, running_balance: balance }
    }).reverse()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Bank account not found</h2>
          <Button onClick={() => navigate('/bank-accounts')} className="mt-4">
            Back to Bank Accounts
          </Button>
        </div>
      </div>
    )
  }

  const filteredTransactions = getFilteredTransactions()
  const transactionsWithBalance = calculateRunningBalance(filteredTransactions)
  const reconciledBalance = transactions
    .filter(t => t.is_reconciled)
    .reduce((sum, t) => {
      return sum + (t.type === 'credit' ? parseFloat(t.amount) : -parseFloat(t.amount))
    }, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/bank-accounts')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bank Accounts
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground">
              {account.code} • {account.description}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/bank-transactions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </Link>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(account.current_balance)}</div>
            <p className="text-xs text-muted-foreground">
              As of {format(new Date(), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reconciled Balance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reconciledBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Cleared transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unreconciled</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(account.current_balance) - reconciledBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transactions</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterReconciled} onValueChange={setFilterReconciled}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                  <SelectItem value="unreconciled">Unreconciled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedTransactions.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkReconcile(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Reconciled ({selectedTransactions.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkReconcile(false)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Mark as Unreconciled
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedTransactions([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions(filteredTransactions.map(t => t.id))
                      } else {
                        setSelectedTransactions([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsWithBalance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                transactionsWithBalance.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransactions([...selectedTransactions, transaction.id])
                          } else {
                            setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.reference || '-'}</TableCell>
                    <TableCell>{transaction.contact_name || transaction.payee || '-'}</TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'debit' ? formatCurrency(transaction.amount) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'credit' ? formatCurrency(transaction.amount) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.running_balance)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReconcileToggle(transaction.id)}
                        className={transaction.is_reconciled ? 'text-green-600' : 'text-muted-foreground'}
                      >
                        {transaction.is_reconciled ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}