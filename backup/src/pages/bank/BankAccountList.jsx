import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import BankAccountService from '@/services/BankAccountService'
import { Button } from '@/components/ui/button'
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
  Plus,
  Building,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from 'lucide-react'

export default function BankAccountList() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const data = await BankAccountService.getAll()
      setAccounts(data)
    } catch (error) {
      console.error('Error loading bank accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + parseFloat(account.current_balance || 0), 0)
  }

  const getPositiveAccounts = () => {
    return accounts.filter(account => parseFloat(account.current_balance) > 0)
  }

  const getNegativeAccounts = () => {
    return accounts.filter(account => parseFloat(account.current_balance) < 0)
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
          <h1 className="text-3xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts and view balances
          </p>
        </div>
        <Link to="/bank-accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Bank Account
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalBalance())}</div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                getPositiveAccounts().reduce((sum, acc) => sum + parseFloat(acc.current_balance), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {getPositiveAccounts().length} account{getPositiveAccounts().length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdrafts</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                Math.abs(getNegativeAccounts().reduce((sum, acc) => sum + parseFloat(acc.current_balance), 0))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {getNegativeAccounts().length} account{getNegativeAccounts().length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.filter(acc => acc.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Of {accounts.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No bank accounts found</p>
              <p className="text-sm text-muted-foreground">
                Create your first bank account to track transactions
              </p>
              <Link to="/bank-accounts/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Bank Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <Link to={`/bank-accounts/${account.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{account.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {account.code} • {account.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(account.current_balance)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current Balance
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${account.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${account.is_active ? 'bg-green-600' : 'bg-red-600'}`} />
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Transactions
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}