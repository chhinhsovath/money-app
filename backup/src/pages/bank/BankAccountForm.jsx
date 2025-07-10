import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import BankAccountService from '@/services/BankAccountService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building, CreditCard, DollarSign } from 'lucide-react'

const bankAccountSchema = z.object({
  code: z.string().min(1, 'Account code is required').regex(/^11\d{2}$/, 'Code must be 4 digits starting with 11'),
  name: z.string().min(1, 'Account name is required'),
  bank_name: z.string().min(1, 'Bank name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  description: z.string().optional(),
  opening_balance: z.number().optional(),
})

export default function BankAccountForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      code: '1100',
      name: '',
      bank_name: '',
      account_number: '',
      description: '',
      opening_balance: 0,
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await BankAccountService.create(data)
      navigate('/bank-accounts')
    } catch (error) {
      console.error('Error creating bank account:', error)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-3xl font-bold">New Bank Account</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Account Code</Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="1100"
                />
                {errors.code && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.code.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Use 11XX format (e.g., 1100, 1101)
                </p>
              </div>

              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Business Checking"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  {...register('bank_name')}
                  placeholder="Chase Bank"
                />
                {errors.bank_name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.bank_name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  {...register('account_number')}
                  placeholder="****1234"
                />
                {errors.account_number && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.account_number.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Primary business checking account"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Opening Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="opening_balance">Opening Balance</Label>
              <Input
                id="opening_balance"
                type="number"
                step="0.01"
                {...register('opening_balance', { valueAsNumber: true })}
                placeholder="0.00"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the current balance to start tracking from today
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/bank-accounts')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Bank Account'}
          </Button>
        </div>
      </form>
    </div>
  )
}