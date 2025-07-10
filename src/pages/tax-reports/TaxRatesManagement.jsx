import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download,
  Calculator,
  Settings,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import TaxService from '@/services/TaxService'
import { formatCurrency } from '@/lib/utils'
import { exportReport } from '@/utils/reportExport'

export default function TaxRatesManagement() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // State management
  const [taxRates, setTaxRates] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRate, setSelectedRate] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    type: 'sales',
    is_active: true
  })
  const [formErrors, setFormErrors] = useState({})
  
  // Calculator states
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [calcAmount, setCalcAmount] = useState('')
  const [calcTaxRate, setCalcTaxRate] = useState('')
  const [calcResult, setCalcResult] = useState(null)

  useEffect(() => {
    loadTaxRates()
  }, [])

  const loadTaxRates = async () => {
    try {
      setLoading(true)
      const rates = await TaxService.getTaxRates()
      setTaxRates(rates)
    } catch (error) {
      console.error('Error loading tax rates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tax rates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Tax rate name is required'
    }
    
    if (!formData.rate || formData.rate === '') {
      errors.rate = 'Tax rate percentage is required'
    } else {
      const rate = parseFloat(formData.rate)
      if (isNaN(rate) || rate < 0 || rate > 100) {
        errors.rate = 'Tax rate must be between 0 and 100'
      }
    }
    
    if (!formData.type) {
      errors.type = 'Tax type is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) return
    
    try {
      const newRate = await TaxService.createTaxRate({
        name: formData.name.trim(),
        rate: parseFloat(formData.rate),
        type: formData.type
      })
      
      setTaxRates([newRate, ...taxRates])
      setIsCreateModalOpen(false)
      resetForm()
      
      toast({
        title: 'Success',
        description: 'Tax rate created successfully'
      })
    } catch (error) {
      console.error('Error creating tax rate:', error)
      toast({
        title: 'Error',
        description: 'Failed to create tax rate',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = async () => {
    if (!validateForm() || !selectedRate) return
    
    try {
      const updatedRate = await TaxService.updateTaxRate(selectedRate.id, {
        name: formData.name.trim(),
        rate: parseFloat(formData.rate),
        type: formData.type,
        is_active: formData.is_active
      })
      
      setTaxRates(taxRates.map(rate => 
        rate.id === selectedRate.id ? updatedRate : rate
      ))
      setIsEditModalOpen(false)
      resetForm()
      
      toast({
        title: 'Success',
        description: 'Tax rate updated successfully'
      })
    } catch (error) {
      console.error('Error updating tax rate:', error)
      toast({
        title: 'Error', 
        description: 'Failed to update tax rate',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedRate) return
    
    try {
      await TaxService.deleteTaxRate(selectedRate.id)
      setTaxRates(taxRates.filter(rate => rate.id !== selectedRate.id))
      setIsDeleteDialogOpen(false)
      setSelectedRate(null)
      
      toast({
        title: 'Success',
        description: 'Tax rate deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting tax rate:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete tax rate. It may be in use.',
        variant: 'destructive'
      })
    }
  }

  const handleStatusToggle = async (rate) => {
    try {
      const updatedRate = await TaxService.updateTaxRate(rate.id, {
        ...rate,
        is_active: !rate.is_active
      })
      
      setTaxRates(taxRates.map(r => 
        r.id === rate.id ? updatedRate : r
      ))
      
      toast({
        title: 'Success',
        description: `Tax rate ${updatedRate.is_active ? 'activated' : 'deactivated'}`
      })
    } catch (error) {
      console.error('Error toggling tax rate status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update tax rate status',
        variant: 'destructive'
      })
    }
  }

  const openEditModal = (rate) => {
    setSelectedRate(rate)
    setFormData({
      name: rate.name,
      rate: rate.rate,
      type: rate.type,
      is_active: rate.is_active
    })
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (rate) => {
    setSelectedRate(rate)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      rate: '',
      type: 'sales',
      is_active: true
    })
    setFormErrors({})
    setSelectedRate(null)
  }

  const calculateTax = () => {
    const amount = parseFloat(calcAmount)
    const rate = parseFloat(calcTaxRate)
    
    if (isNaN(amount) || isNaN(rate)) {
      setCalcResult(null)
      return
    }
    
    const taxAmount = (amount * rate) / 100
    const totalAmount = amount + taxAmount
    
    setCalcResult({
      baseAmount: amount,
      taxRate: rate,
      taxAmount: taxAmount,
      totalAmount: totalAmount
    })
  }

  const exportTaxRates = () => {
    const data = filteredRates.map(rate => ({
      name: rate.name,
      rate: `${rate.rate}%`,
      type: rate.type,
      status: rate.is_active ? 'Active' : 'Inactive',
      created_date: new Date(rate.created_at).toLocaleDateString(),
      last_updated: new Date(rate.updated_at).toLocaleDateString()
    }))
    
    const columns = [
      { key: 'name', label: 'Tax Rate Name', type: 'text' },
      { key: 'rate', label: 'Rate', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'created_date', label: 'Created', type: 'text' },
      { key: 'last_updated', label: 'Last Updated', type: 'text' }
    ]
    
    exportReport(
      'excel',
      data,
      columns,
      'Tax Rates Configuration',
      'tax-rates-config'
    )
  }

  // Filter and search logic
  const filteredRates = taxRates.filter(rate => {
    const matchesSearch = rate.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || rate.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && rate.is_active) ||
      (statusFilter === 'inactive' && !rate.is_active)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type) => {
    switch (type) {
      case 'sales': return 'bg-green-100 text-green-800'
      case 'purchase': return 'bg-blue-100 text-blue-800'
      case 'both': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/tax-reports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tax Rates Management</h1>
            <p className="text-muted-foreground">Configure and manage tax rates for your organization</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCalculatorOpen(true)}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculator
          </Button>
          <Button
            variant="outline"
            onClick={exportTaxRates}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tax Rate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-sm">
              <Label htmlFor="search">Search Tax Rates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadTaxRates} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates ({filteredRates.length})</CardTitle>
          <CardDescription>
            Manage tax rates for sales, purchases, or both
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.name}</TableCell>
                  <TableCell>{rate.rate}%</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(rate.type)}>
                      {rate.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rate.is_active}
                        onCheckedChange={() => handleStatusToggle(rate)}
                      />
                      <span className="text-sm">
                        {rate.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(rate.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(rate)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRates.length === 0 && (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No tax rates found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first tax rate.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tax Rate Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tax Rate</DialogTitle>
            <DialogDescription>
              Add a new tax rate for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Tax Rate Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., VAT, GST, Sales Tax"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="create-rate">Tax Rate (%)</Label>
              <Input
                id="create-rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                placeholder="e.g., 8.25"
                className={formErrors.rate ? 'border-red-500' : ''}
              />
              {formErrors.rate && (
                <p className="text-sm text-red-500 mt-1">{formErrors.rate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="create-type">Tax Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className={formErrors.type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Only</SelectItem>
                  <SelectItem value="purchase">Purchase Only</SelectItem>
                  <SelectItem value="both">Both Sales & Purchase</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="text-sm text-red-500 mt-1">{formErrors.type}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Tax Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tax Rate Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tax Rate</DialogTitle>
            <DialogDescription>
              Modify the selected tax rate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tax Rate Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-rate">Tax Rate (%)</Label>
              <Input
                id="edit-rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                className={formErrors.rate ? 'border-red-500' : ''}
              />
              {formErrors.rate && (
                <p className="text-sm text-red-500 mt-1">{formErrors.rate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-type">Tax Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className={formErrors.type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Only</SelectItem>
                  <SelectItem value="purchase">Purchase Only</SelectItem>
                  <SelectItem value="both">Both Sales & Purchase</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="text-sm text-red-500 mt-1">{formErrors.type}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Update Tax Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRate?.name}"? This action cannot be undone.
              If this tax rate is being used in existing transactions, the deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tax Calculator Modal */}
      <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tax Calculator</DialogTitle>
            <DialogDescription>
              Test tax calculations with your configured rates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="calc-amount">Base Amount</Label>
              <Input
                id="calc-amount"
                type="number"
                step="0.01"
                value={calcAmount}
                onChange={(e) => {
                  setCalcAmount(e.target.value)
                  setCalcResult(null)
                }}
                placeholder="Enter amount to calculate tax"
              />
            </div>
            <div>
              <Label htmlFor="calc-rate">Tax Rate (%)</Label>
              <Select value={calcTaxRate} onValueChange={setCalcTaxRate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tax rate" />
                </SelectTrigger>
                <SelectContent>
                  {taxRates.filter(rate => rate.is_active).map(rate => (
                    <SelectItem key={rate.id} value={rate.rate}>
                      {rate.name} - {rate.rate}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={calculateTax} className="w-full">
              Calculate Tax
            </Button>
            
            {calcResult && (
              <div className="border rounded-lg p-4 bg-muted">
                <h4 className="font-semibold mb-2">Calculation Result</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>{formatCurrency(calcResult.baseAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Rate:</span>
                    <span>{calcResult.taxRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>{formatCurrency(calcResult.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(calcResult.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCalculatorOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}