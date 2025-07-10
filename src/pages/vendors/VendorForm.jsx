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
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  CreditCard, 
  Calendar,
  Globe,
  Save,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().optional(),
  contact_person: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  tax_number: z.string().optional(),
  payment_terms: z.number().min(0, 'Payment terms must be positive').optional(),
  credit_limit: z.number().min(0, 'Credit limit must be positive').optional(),
  is_active: z.boolean().default(true),
})

export default function VendorForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [vendor, setVendor] = useState(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      contact_person: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      tax_number: '',
      payment_terms: 30,
      credit_limit: 0,
      is_active: true,
    },
  })

  const isActive = watch('is_active')

  useEffect(() => {
    if (id) {
      loadVendor()
    }
  }, [id])

  const loadVendor = async () => {
    try {
      const data = await ContactService.getById(id)
      setVendor(data)
      
      // Set form values
      setValue('name', data.name)
      setValue('email', data.email || '')
      setValue('phone', data.phone || '')
      setValue('contact_person', data.contact_person || '')
      setValue('address', data.address || '')
      setValue('city', data.city || '')
      setValue('state', data.state || '')
      setValue('postal_code', data.postal_code || '')
      setValue('country', data.country || '')
      setValue('tax_number', data.tax_number || '')
      setValue('payment_terms', data.payment_terms || 30)
      setValue('credit_limit', parseFloat(data.credit_limit) || 0)
      setValue('is_active', data.is_active)
    } catch (error) {
      console.error('Error loading vendor:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vendor details',
        variant: 'destructive'
      })
      navigate('/vendors')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const vendorData = {
        ...data,
        type: 'supplier',
        email: data.email || null,
        phone: data.phone || null,
        contact_person: data.contact_person || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        country: data.country || null,
        tax_number: data.tax_number || null,
        payment_terms: data.payment_terms || 30,
        credit_limit: data.credit_limit || null,
      }

      if (id) {
        await ContactService.update(id, vendorData)
        toast({
          title: 'Success',
          description: 'Vendor updated successfully'
        })
      } else {
        await ContactService.create(vendorData)
        toast({
          title: 'Success',
          description: 'Vendor created successfully'
        })
      }
      navigate('/vendors')
    } catch (error) {
      console.error('Error saving vendor:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save vendor',
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
          onClick={() => navigate('/vendors')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          {id ? 'Edit Vendor' : 'New Vendor'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter vendor name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="vendor@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="contact_person" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Person
                </Label>
                <Input
                  id="contact_person"
                  {...register('contact_person')}
                  placeholder="Primary contact name"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Active vendor
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Enter street address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    {...register('postal_code')}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    {...register('country')}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input
                  id="tax_number"
                  {...register('tax_number')}
                  placeholder="Tax ID or VAT number"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Credit Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_terms" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Payment Terms (days)
                </Label>
                <Input
                  id="payment_terms"
                  type="number"
                  {...register('payment_terms', { valueAsNumber: true })}
                  placeholder="30"
                  min="0"
                />
                {errors.payment_terms && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.payment_terms.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="credit_limit" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Credit Limit
                </Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  {...register('credit_limit', { valueAsNumber: true })}
                  placeholder="0.00"
                  min="0"
                />
                {errors.credit_limit && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.credit_limit.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/vendors')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : id ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </div>
  )
}