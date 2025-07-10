import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import ExpenseService from '@/services/ExpenseService'
import AccountService from '@/services/AccountService'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Receipt,
  Calendar,
  DollarSign,
  FileText,
  Upload
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  line_items: z.array(
    z.object({
      date: z.string().optional(),
      description: z.string().min(1, 'Description is required'),
      amount: z.number().min(0.01, 'Amount must be greater than 0'),
      account_id: z.string().min(1, 'Account is required'),
      receipt_url: z.string().optional(),
    })
  ).min(1, 'At least one expense item is required'),
})

export default function ExpenseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [expense, setExpense] = useState(null)
  const { toast } = useToast()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      line_items: [
        {
          date: '',
          description: '',
          amount: 0,
          account_id: '',
          receipt_url: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  })

  const lineItems = watch('line_items')

  useEffect(() => {
    loadAccounts()
    if (id) {
      loadExpense()
    }
  }, [id])

  const loadAccounts = async () => {
    try {
      const data = await AccountService.getAll()
      // Filter for expense accounts
      const expenseAccounts = data.filter(acc => 
        acc.type === 'expense' || 
        acc.type === 'other_expense' || 
        acc.type === 'cost_of_goods_sold'
      )
      setAccounts(expenseAccounts)
    } catch (error) {
      console.error('Error loading accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load expense accounts',
        variant: 'destructive'
      })
    }
  }

  const loadExpense = async () => {
    try {
      const data = await ExpenseService.getById(id)
      setExpense(data)
      
      // Set form values
      setValue('date', format(new Date(data.date), 'yyyy-MM-dd'))
      setValue('notes', data.notes || '')
      
      if (data.line_items && data.line_items.length > 0) {
        setValue('line_items', data.line_items.map(item => ({
          date: item.date ? format(new Date(item.date), 'yyyy-MM-dd') : '',
          description: item.description,
          amount: parseFloat(item.amount),
          account_id: item.account_id,
          receipt_url: item.receipt_url || '',
        })))
      }
    } catch (error) {
      console.error('Error loading expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to load expense claim',
        variant: 'destructive'
      })
      navigate('/expenses')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (id) {
        await ExpenseService.update(id, data)
        toast({
          title: 'Success',
          description: 'Expense claim updated successfully'
        })
      } else {
        await ExpenseService.create(data)
        toast({
          title: 'Success',
          description: 'Expense claim created successfully'
        })
      }
      navigate('/expenses')
    } catch (error) {
      console.error('Error saving expense:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save expense claim',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const addLineItem = () => {
    append({
      date: '',
      description: '',
      amount: 0,
      account_id: '',
      receipt_url: '',
    })
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0)
    }, 0)
  }

  const handleReceiptUpload = (index) => {
    // In a real app, this would handle file upload
    toast({
      title: 'Coming Soon',
      description: 'Receipt upload will be available soon',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/expenses')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Expenses
        </Button>
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Expense Claim' : 'New Expense Claim'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Expense Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expense Date
                </Label>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any additional notes about this expense claim"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
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
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead className="w-[20%]">Category</TableHead>
                  <TableHead className="w-[15%]">Amount</TableHead>
                  <TableHead className="w-[10%]">Receipt</TableHead>
                  <TableHead className="w-[5%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        type="date"
                        {...register(`line_items.${index}.date`)}
                        placeholder="Optional"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        {...register(`line_items.${index}.description`)}
                        placeholder="Expense description"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={watch(`line_items.${index}.account_id`)}
                        onValueChange={(value) => setValue(`line_items.${index}.account_id`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`line_items.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReceiptUpload(index)}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {errors.line_items && (
              <p className="text-sm text-destructive mt-2">
                {errors.line_items.message}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={addLineItem}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(calculateTotal())}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/expenses')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Expense Claim' : 'Create Expense Claim'}
          </Button>
        </div>
      </form>
    </div>
  )
}