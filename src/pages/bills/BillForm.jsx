import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import BillService from '@/services/BillService'
import ContactService from '@/services/ContactService'
import api from '@/services/api'
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
import { Plus, Trash2, ArrowLeft, Receipt } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const billSchema = z.object({
  contact_id: z.string().min(1, 'Supplier is required'),
  bill_date: z.string().min(1, 'Bill date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  line_items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
      unit_price: z.number().min(0, 'Unit price must be 0 or greater'),
      tax_amount: z.number().optional(),
      account_id: z.string().min(1, 'Account is required'),
    })
  ).min(1, 'At least one line item is required'),
})

export default function BillForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [bill, setBill] = useState(null)
  
  // Get contact from URL query params
  const searchParams = new URLSearchParams(window.location.search)
  const preselectedContactId = searchParams.get('contact')

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: {
      contact_id: '',
      bill_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      reference: '',
      notes: '',
      line_items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          tax_amount: 0,
          account_id: '',
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
    loadData()
    if (id) {
      loadBill()
    } else if (preselectedContactId) {
      setValue('contact_id', preselectedContactId)
    }
  }, [id, preselectedContactId])

  const loadData = async () => {
    try {
      const [contactsData, accountsData] = await Promise.all([
        ContactService.getAll('supplier'),
        api.get('/accounts/expense'),
      ])
      setContacts(contactsData)
      setAccounts(accountsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const loadBill = async () => {
    try {
      const data = await BillService.getById(id)
      setBill(data)
      
      // Set form values
      setValue('contact_id', data.contact_id)
      setValue('bill_date', format(new Date(data.bill_date), 'yyyy-MM-dd'))
      setValue('due_date', format(new Date(data.due_date), 'yyyy-MM-dd'))
      setValue('reference', data.reference || '')
      setValue('notes', data.notes || '')
      
      if (data.line_items && data.line_items.length > 0) {
        setValue('line_items', data.line_items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          tax_amount: parseFloat(item.tax_amount) || 0,
          account_id: item.account_id ? item.account_id.toString() : '',
        })))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bill details. Please try again.',
        variant: 'destructive',
      })
      navigate('/bills')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const billData = {
        ...data,
        status: bill?.status || 'draft',
      }
      
      if (id) {
        await BillService.update(id, billData)
        toast({
          title: 'Success',
          description: 'Bill updated successfully.',
        })
      } else {
        await BillService.create(billData)
        toast({
          title: 'Success',
          description: 'Bill created successfully.',
        })
      }
      navigate('/bills')
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bill. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const addLineItem = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_amount: 0,
      account_id: '',
    })
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)
  }

  const calculateTax = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (item.tax_amount || 0)
    }, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/bills')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bills
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Receipt className="h-8 w-8" />
          {id ? 'Edit Bill' : 'New Bill'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_id">Supplier</Label>
                <Select
                  value={watch('contact_id')}
                  onValueChange={(value) => setValue('contact_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contact_id && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.contact_id.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="reference">Supplier Invoice #</Label>
                <Input
                  id="reference"
                  {...register('reference')}
                  placeholder="SUP-12345"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bill_date">Bill Date</Label>
                <Input
                  id="bill_date"
                  type="date"
                  {...register('bill_date')}
                />
                {errors.bill_date && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.bill_date.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register('due_date')}
                />
                {errors.due_date && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.due_date.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead className="w-[20%]">Account</TableHead>
                  <TableHead className="w-[10%]">Quantity</TableHead>
                  <TableHead className="w-[10%]">Unit Price</TableHead>
                  <TableHead className="w-[10%]">Tax</TableHead>
                  <TableHead className="w-[10%]">Amount</TableHead>
                  <TableHead className="w-[5%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        {...register(`line_items.${index}.description`)}
                        placeholder="Item description"
                      />
                      {errors.line_items?.[index]?.description && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.line_items[index].description.message}
                        </p>
                      )}
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
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.line_items?.[index]?.account_id && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.line_items[index].account_id.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`line_items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`line_items.${index}.unit_price`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`line_items.${index}.tax_amount`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      ${(lineItems[index]?.quantity * lineItems[index]?.unit_price || 0).toFixed(2)}
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
              Add Line Item
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Notes about this bill (internal use only)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium">
                    ${calculateTax().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/bills')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Bill' : 'Create Bill'}
          </Button>
        </div>
      </form>
    </div>
  )
}