import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { ArrowLeft, User, Building, Mail, Phone, MapPin, CreditCard } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['customer', 'supplier', 'both'], {
    required_error: 'Type is required',
  }),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_number: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
})

export default function ContactForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      type: 'customer',
      email: '',
      phone: '',
      address: '',
      tax_number: '',
      contact_person: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (id) {
      loadContact()
    }
  }, [id])

  const loadContact = async () => {
    try {
      const data = await ContactService.getById(id)
      
      // Set form values
      setValue('name', data.name)
      setValue('type', data.type)
      setValue('email', data.email || '')
      setValue('phone', data.phone || '')
      setValue('address', data.address || '')
      setValue('tax_number', data.tax_number || '')
      setValue('contact_person', data.contact_person || '')
      setValue('notes', data.notes || '')
    } catch (error) {
      console.error('Error loading contact:', error)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Convert empty strings to null for optional fields
      const contactData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        tax_number: data.tax_number || null,
        contact_person: data.contact_person || null,
        notes: data.notes || null,
      }

      if (id) {
        await ContactService.update(id, contactData)
      } else {
        await ContactService.create(contactData)
      }
      navigate('/contacts')
    } catch (error) {
      console.error('Error saving contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const contactType = watch('type')

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/contacts')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Contact' : 'New Contact'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Company or person name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.type.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {contactType === 'customer' && 'Can create invoices for this contact'}
                  {contactType === 'supplier' && 'Can create bills from this contact'}
                  {contactType === 'both' && 'Can create both invoices and bills'}
                </p>
              </div>

              <div>
                <Label htmlFor="contact_person">
                  <User className="inline h-4 w-4 mr-1" />
                  Contact Person
                </Label>
                <Input
                  id="contact_person"
                  {...register('contact_person')}
                  placeholder="Primary contact person"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contact@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="tax_number">
                  <CreditCard className="inline h-4 w-4 mr-1" />
                  Tax Number
                </Label>
                <Input
                  id="tax_number"
                  {...register('tax_number')}
                  placeholder="VAT/Tax ID"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <MapPin className="inline h-5 w-5 mr-2" />
              Address & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Street address, city, state, zip"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Notes about this contact (not visible to them)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contacts')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  )
}