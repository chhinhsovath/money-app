import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import BankAccountService from '@/services/BankAccountService'
import BankTransactionService from '@/services/BankTransactionService'
import ContactService from '@/services/ContactService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  FileText, 
  Building2,
  User,
  Hash,
  Save,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const transactionSchema = z.object({
  bank_account_id: z.string().min(1, 'Bank account is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['debit', 'credit'], {
    required_error: 'Transaction type is required',
  }),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  payee: z.string().optional(),
  contact_id: z.string().optional(),
})

export default function TransactionForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [bankAccounts, setBankAccounts] = useState([])
  const [contacts, setContacts] = useState([])
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      bank_account_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'debit',
      amount: 0,
      description: '',
      reference: '',
      payee: '',
      contact_id: '',
    },
  })

  const transactionType = watch('type')

  useEffect(() => {
    loadData()
    if (id) {
      loadTransaction()
    }
  }, [id])

  const loadData = async () => {
    try {
      const [accountsData, contactsData] = await Promise.all([
        BankAccountService.getAll(),
        ContactService.getAll(),
      ])
      setBankAccounts(accountsData)
      setContacts(contactsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load form data',
        variant: 'destructive'
      })
    }
  }

  const loadTransaction = async () => {
    try {
      const data = await BankTransactionService.getById(id)
      setTransaction(data)
      
      // Set form values
      setValue('bank_account_id', data.bank_account_id)
      setValue('date', format(new Date(data.date), 'yyyy-MM-dd'))
      setValue('type', data.type)
      setValue('amount', parseFloat(data.amount))
      setValue('description', data.description || '')
      setValue('reference', data.reference || '')
      setValue('payee', data.payee || '')
      setValue('contact_id', data.contact_id || '')
    } catch (error) {
      console.error('Error loading transaction:', error)
      toast({
        title: 'Error',
        description: 'Failed to load transaction details',
        variant: 'destructive'
      })
      navigate('/transactions')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const transactionData = {
        ...data,
        contact_id: data.contact_id || null,
        reference: data.reference || null,
        payee: data.payee || null,
      }

      if (id) {
        await BankTransactionService.update(id, transactionData)
        toast({
          title: 'Success',
          description: 'Transaction updated successfully'
        })
      } else {
        await BankTransactionService.create(transactionData)
        toast({
          title: 'Success',
          description: 'Transaction created successfully'
        })
      }
      
      navigate('/transactions')
    } catch (error) {
      console.error('Error saving transaction:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save transaction',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/transactions')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          {id ? 'Edit Transaction' : 'New Transaction'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bank_account_id" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bank Account *
                </Label>
                <Select
                  value={watch('bank_account_id')}
                  onValueChange={(value) => setValue('bank_account_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bank_account_id && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.bank_account_id.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Transaction Type *</Label>
                  <Select
                    value={watch('type')}
                    onValueChange={(value) => setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Money Out (Debit)</SelectItem>
                      <SelectItem value="credit">Money In (Credit)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {transactionType === 'debit' 
                    ? 'Amount leaving your account' 
                    : 'Amount entering your account'}
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description *
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Transaction description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reference" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Reference
                </Label>
                <Input
                  id="reference"
                  {...register('reference')}
                  placeholder="Check #, Invoice #, etc."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional reference number or code
                </p>
              </div>

              <div>
                <Label htmlFor="payee">Payee/Payer</Label>
                <Input
                  id="payee"
                  {...register('payee')}
                  placeholder="Name on transaction"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Who you paid or who paid you
                </p>
              </div>

              <div>
                <Label htmlFor="contact_id" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Link to Contact
                </Label>
                <Select
                  value={watch('contact_id')}
                  onValueChange={(value) => setValue('contact_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Link this transaction to a customer or supplier
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {transactionType && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transaction Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                  <p className="font-medium text-lg">
                    {transactionType === 'credit' ? 'Money In (Credit)' : 'Money Out (Debit)'}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Account Impact</p>
                  <p className={`font-medium text-lg ${transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transactionType === 'credit' ? 'Balance Increases' : 'Balance Decreases'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/transactions')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : id ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </div>
  )
}