import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { ArrowLeft, DollarSign, Calendar, FileText } from 'lucide-react'

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

export default function BankTransactionForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState([])
  const [contacts, setContacts] = useState([])

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

  useEffect(() => {
    loadData()
  }, [])

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
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const transactionData = {
        ...data,
        contact_id: data.contact_id || null,
      }
      await BankTransactionService.create(transactionData)
      
      // Navigate back to the bank account view
      if (data.bank_account_id) {
        navigate(`/bank-accounts/${data.bank_account_id}`)
      } else {
        navigate('/bank-accounts')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const transactionType = watch('type')

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">New Bank Transaction</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bank_account_id">Bank Account</Label>
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
                <p className="text-sm text-destructive mt-1">
                  {errors.bank_account_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
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
                  <p className="text-sm text-destructive mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Transaction description"
                rows={2}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  {...register('reference')}
                  placeholder="Check #, Invoice #, etc."
                />
              </div>

              <div>
                <Label htmlFor="payee">Payee/Payer</Label>
                <Input
                  id="payee"
                  {...register('payee')}
                  placeholder="Name on transaction"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_id">Link to Contact</Label>
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </div>
  )
}