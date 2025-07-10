import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import InvoiceService from '@/services/InvoiceService'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const invoiceSchema = z.object({
  contact_id: z.string().min(1, 'Customer is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  line_items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
      unit_price: z.number().min(0, 'Unit price must be 0 or greater'),
      tax_amount: z.number().optional(),
    })
  ).min(1, 'At least one line item is required'),
})

export default function InvoiceForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [invoice, setInvoice] = useState(null)
  const { toast } = useToast()
  
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
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      contact_id: '',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      reference: '',
      notes: '',
      terms: 'Net 30',
      line_items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          tax_amount: 0,
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
    loadContacts()
    if (id) {
      loadInvoice()
    } else if (preselectedContactId) {
      setValue('contact_id', preselectedContactId)
    }
  }, [id, preselectedContactId])

  const loadContacts = async () => {
    try {
      const data = await ContactService.getAll('customer')
      setContacts(data)
    } catch (error) {
      console.error('Error loading contacts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive'
      })
    }
  }

  const loadInvoice = async () => {
    try {
      const data = await InvoiceService.getById(id)
      setInvoice(data)
      
      // Set form values
      setValue('contact_id', data.contact_id)
      setValue('invoice_date', format(new Date(data.invoice_date), 'yyyy-MM-dd'))
      setValue('due_date', format(new Date(data.due_date), 'yyyy-MM-dd'))
      setValue('reference', data.reference || '')
      setValue('notes', data.notes || '')
      setValue('terms', data.terms || '')
      
      if (data.line_items && data.line_items.length > 0) {
        setValue('line_items', data.line_items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          tax_amount: parseFloat(item.tax_amount) || 0,
        })))
      }
    } catch (error) {
      console.error('Error loading invoice:', error)
      toast({
        title: 'Error',
        description: 'Failed to load invoice',
        variant: 'destructive'
      })
      navigate('/invoices')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (id) {
        await InvoiceService.update(id, data)
        toast({
          title: 'Success',
          description: 'Invoice updated successfully'
        })
      } else {
        await InvoiceService.create(data)
        toast({
          title: 'Success',
          description: 'Invoice created successfully'
        })
      }
      navigate('/invoices')
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save invoice',
        variant: 'destructive'
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
          onClick={() => navigate('/invoices')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Invoice' : 'New Invoice'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_id">Customer</Label>
                <Select
                  value={watch('contact_id')}
                  onValueChange={(value) => setValue('contact_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
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
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  {...register('reference')}
                  placeholder="PO-12345"
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
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  {...register('invoice_date')}
                />
                {errors.invoice_date && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.invoice_date.message}
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
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead className="w-[15%]">Quantity</TableHead>
                  <TableHead className="w-[15%]">Unit Price</TableHead>
                  <TableHead className="w-[15%]">Amount</TableHead>
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
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Notes for the customer"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms</Label>
                <Input
                  id="terms"
                  {...register('terms')}
                  placeholder="Net 30"
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
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}