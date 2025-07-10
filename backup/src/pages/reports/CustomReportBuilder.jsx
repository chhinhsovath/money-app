import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Plus, X, Play, Save } from 'lucide-react'
import ReportBuilder from '@/components/reports/ReportBuilder'
import DynamicReportTable from '@/components/reports/DynamicReportTable'
import { exportReport } from '@/utils/reportExport'
import { useToast } from '@/components/ui/use-toast'
import accountService from '@/services/AccountService'
import contactService from '@/services/ContactService'
import invoiceService from '@/services/InvoiceService'
import billService from '@/services/BillService'

// Available data sources and their fields
const dataSources = {
  invoices: {
    label: 'Invoices',
    service: invoiceService,
    fields: [
      { key: 'invoice_number', label: 'Invoice Number', type: 'text' },
      { key: 'invoice_date', label: 'Invoice Date', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'contact_name', label: 'Customer', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency', align: 'right' },
      { key: 'tax_total', label: 'Tax', type: 'currency', align: 'right' },
      { key: 'total', label: 'Total', type: 'currency', align: 'right' },
      { key: 'amount_due', label: 'Amount Due', type: 'currency', align: 'right' }
    ]
  },
  bills: {
    label: 'Bills',
    service: billService,
    fields: [
      { key: 'bill_number', label: 'Bill Number', type: 'text' },
      { key: 'bill_date', label: 'Bill Date', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'contact_name', label: 'Supplier', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'subtotal', label: 'Subtotal', type: 'currency', align: 'right' },
      { key: 'tax_total', label: 'Tax', type: 'currency', align: 'right' },
      { key: 'total', label: 'Total', type: 'currency', align: 'right' },
      { key: 'amount_due', label: 'Amount Due', type: 'currency', align: 'right' }
    ]
  },
  contacts: {
    label: 'Contacts',
    service: contactService,
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'tax_number', label: 'Tax Number', type: 'text' },
      { key: 'contact_person', label: 'Contact Person', type: 'text' },
      { key: 'created_at', label: 'Created Date', type: 'date' }
    ]
  },
  accounts: {
    label: 'Chart of Accounts',
    service: accountService,
    fields: [
      { key: 'code', label: 'Account Code', type: 'text' },
      { key: 'name', label: 'Account Name', type: 'text' },
      { key: 'type', label: 'Account Type', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'is_active', label: 'Active', type: 'boolean' }
    ]
  }
}

// Filter operators
const operators = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
    { value: 'not_equals', label: 'Not equals' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'between', label: 'Between' }
  ],
  date: [
    { value: 'equals', label: 'On' },
    { value: 'after', label: 'After' },
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'last_days', label: 'Last X days' },
    { value: 'next_days', label: 'Next X days' }
  ],
  currency: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'between', label: 'Between' }
  ]
}

export default function CustomReportBuilder() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [reportName, setReportName] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedFields, setSelectedFields] = useState([])
  const [filters, setFilters] = useState([])
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [savedReports, setSavedReports] = useState([])

  // Load saved reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customReports')
    if (saved) {
      setSavedReports(JSON.parse(saved))
    }
  }, [])

  const handleSourceChange = (source) => {
    setSelectedSource(source)
    setSelectedFields([])
    setFilters([])
    setReportData([])
  }

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => {
      const exists = prev.find(f => f.key === field.key)
      if (exists) {
        return prev.filter(f => f.key !== field.key)
      }
      return [...prev, field]
    })
  }

  const handleAddFilter = () => {
    const sourceFields = dataSources[selectedSource]?.fields || []
    if (sourceFields.length === 0) return
    
    setFilters([...filters, {
      id: Date.now(),
      field: sourceFields[0].key,
      operator: 'equals',
      value: ''
    }])
  }

  const handleUpdateFilter = (filterId, updates) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, ...updates } : filter
    ))
  }

  const handleRemoveFilter = (filterId) => {
    setFilters(prev => prev.filter(f => f.id !== filterId))
  }

  const handleRunReport = async () => {
    if (!selectedSource || selectedFields.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a data source and at least one field',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      // Fetch data from the selected source
      const service = dataSources[selectedSource].service
      const response = await service.getAll()
      let data = response.data

      // Apply filters
      data = applyFilters(data, filters)

      setReportData(data)
      
      toast({
        title: 'Success',
        description: `Report generated with ${data.length} records`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (data, filters) => {
    return data.filter(row => {
      return filters.every(filter => {
        const value = row[filter.field]
        const filterValue = filter.value

        switch (filter.operator) {
          case 'equals':
            return value == filterValue
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
          case 'starts_with':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
          case 'ends_with':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())
          case 'not_equals':
            return value != filterValue
          case 'greater_than':
            return Number(value) > Number(filterValue)
          case 'less_than':
            return Number(value) < Number(filterValue)
          case 'between':
            const [min, max] = filterValue.split(',').map(v => v.trim())
            return Number(value) >= Number(min) && Number(value) <= Number(max)
          case 'after':
            return new Date(value) > new Date(filterValue)
          case 'before':
            return new Date(value) < new Date(filterValue)
          case 'last_days':
            const daysAgo = new Date()
            daysAgo.setDate(daysAgo.getDate() - Number(filterValue))
            return new Date(value) >= daysAgo
          case 'next_days':
            const daysAhead = new Date()
            daysAhead.setDate(daysAhead.getDate() + Number(filterValue))
            return new Date(value) <= daysAhead
          default:
            return true
        }
      })
    })
  }

  const handleSaveReport = () => {
    if (!reportName) {
      toast({
        title: 'Error',
        description: 'Please enter a report name',
        variant: 'destructive'
      })
      return
    }

    const report = {
      id: Date.now(),
      name: reportName,
      source: selectedSource,
      fields: selectedFields,
      filters,
      createdAt: new Date().toISOString()
    }

    const updatedReports = [...savedReports, report]
    setSavedReports(updatedReports)
    localStorage.setItem('customReports', JSON.stringify(updatedReports))

    toast({
      title: 'Success',
      description: 'Report saved successfully'
    })
  }

  const handleLoadReport = (report) => {
    setReportName(report.name)
    setSelectedSource(report.source)
    setSelectedFields(report.fields)
    setFilters(report.filters)
    setReportData([])
  }

  const handleDeleteReport = (reportId) => {
    const updatedReports = savedReports.filter(r => r.id !== reportId)
    setSavedReports(updatedReports)
    localStorage.setItem('customReports', JSON.stringify(updatedReports))
  }

  const handleExport = (format, exportData) => {
    exportReport(
      format,
      exportData.data,
      exportData.columns,
      reportName || 'Custom Report',
      `custom-report-${Date.now()}`
    )
  }

  const sourceFields = dataSources[selectedSource]?.fields || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/reports')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Custom Report Builder</h1>
          <p className="text-muted-foreground">Create your own custom reports</p>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Configure your custom report settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    placeholder="Enter report name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-source">Data Source</Label>
                  <Select value={selectedSource} onValueChange={handleSourceChange}>
                    <SelectTrigger id="data-source">
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(dataSources).map(([key, source]) => (
                        <SelectItem key={key} value={key}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          {selectedSource && (
            <Card>
              <CardHeader>
                <CardTitle>Select Fields</CardTitle>
                <CardDescription>Choose which fields to include in your report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {sourceFields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.key}
                        checked={selectedFields.some(f => f.key === field.key)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <Label
                        htmlFor={field.key}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {field.label}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          {selectedSource && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Add filters to refine your data</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleAddFilter}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filters.map((filter) => {
                    const field = sourceFields.find(f => f.key === filter.field)
                    const availableOperators = operators[field?.type] || operators.text
                    
                    return (
                      <div key={filter.id} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Field</Label>
                          <Select
                            value={filter.field}
                            onValueChange={(value) => handleUpdateFilter(filter.id, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sourceFields.map((field) => (
                                <SelectItem key={field.key} value={field.key}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => handleUpdateFilter(filter.id, { operator: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableOperators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Value</Label>
                          <Input
                            placeholder={filter.operator === 'between' ? 'min,max' : 'Value'}
                            value={filter.value}
                            onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                          />
                        </div>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveFilter(filter.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                  
                  {filters.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No filters applied. Click "Add Filter" to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {selectedSource && (
            <div className="flex gap-2">
              <Button onClick={handleRunReport} disabled={loading || selectedFields.length === 0}>
                <Play className="mr-2 h-4 w-4" />
                {loading ? 'Running...' : 'Run Report'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveReport}
                disabled={!reportName || selectedFields.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Report
              </Button>
            </div>
          )}

          {/* Report Results */}
          {reportData.length > 0 && (
            <ReportBuilder
              title={reportName || 'Custom Report'}
              columns={selectedFields}
              data={reportData}
              filters={[]}
              defaultVisibleColumns={selectedFields.map(f => f.key)}
              onExport={handleExport}
            >
              <DynamicReportTable
                data={reportData}
                columns={selectedFields}
                visibleColumns={selectedFields.map(f => f.key)}
                showTotals={true}
              />
            </ReportBuilder>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Load and manage your saved custom reports</CardDescription>
            </CardHeader>
            <CardContent>
              {savedReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved reports yet. Create and save a report to see it here.
                </p>
              ) : (
                <div className="space-y-2">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <div onClick={() => handleLoadReport(report)} className="flex-1">
                        <h4 className="font-medium">{report.name}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Source: {dataSources[report.source]?.label}</span>
                          <span>{report.fields.length} fields</span>
                          <span>{report.filters.length} filters</span>
                          <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteReport(report.id)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}