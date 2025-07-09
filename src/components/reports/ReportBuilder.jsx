import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  Download, 
  Printer, 
  FileSpreadsheet,
  FilePdf,
  Eye,
  EyeOff,
  Settings2,
  Save,
  Grid3x3,
  SlidersHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ReportBuilder({ 
  title,
  columns = [],
  data = [],
  filters = [],
  onFilterChange,
  onColumnsChange,
  onExport,
  children,
  defaultVisibleColumns = []
}) {
  const [visibleColumns, setVisibleColumns] = useState(
    defaultVisibleColumns.length > 0 ? defaultVisibleColumns : columns.map(col => col.key)
  )
  const [groupBy, setGroupBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [savedViews, setSavedViews] = useState([])
  const [viewName, setViewName] = useState('')
  const [activeFilters, setActiveFilters] = useState({})

  const handleColumnToggle = (columnKey) => {
    const newColumns = visibleColumns.includes(columnKey)
      ? visibleColumns.filter(key => key !== columnKey)
      : [...visibleColumns, columnKey]
    
    setVisibleColumns(newColumns)
    if (onColumnsChange) {
      onColumnsChange(newColumns)
    }
  }

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value }
    setActiveFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const handleSaveView = () => {
    if (!viewName) return
    
    const newView = {
      id: Date.now(),
      name: viewName,
      columns: visibleColumns,
      filters: activeFilters,
      groupBy,
      sortBy,
      sortOrder
    }
    
    setSavedViews([...savedViews, newView])
    setViewName('')
  }

  const handleLoadView = (view) => {
    setVisibleColumns(view.columns)
    setActiveFilters(view.filters)
    setGroupBy(view.groupBy)
    setSortBy(view.sortBy)
    setSortOrder(view.sortOrder)
    
    if (onColumnsChange) {
      onColumnsChange(view.columns)
    }
    if (onFilterChange) {
      onFilterChange(view.filters)
    }
  }

  const handleExport = (format) => {
    if (onExport) {
      onExport(format, {
        data,
        columns: columns.filter(col => visibleColumns.includes(col.key)),
        filters: activeFilters,
        groupBy,
        sortBy,
        sortOrder
      })
    }
  }

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length

  return (
    <div className="space-y-4">
      {/* Report Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {activeFilterCount > 0 && (
            <div className="flex gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {Object.entries(activeFilters).map(([key, value]) => 
                value && (
                  <Badge key={key} variant="secondary">
                    {filters.find(f => f.key === key)?.label}: {value}
                  </Badge>
                )
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Column Settings */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Grid3x3 className="mr-2 h-4 w-4" />
                Columns ({visibleColumns.length}/{columns.length})
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Display Columns</SheetTitle>
                <SheetDescription>
                  Choose which columns to show in the report
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {columns.map((column) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.key}
                      checked={visibleColumns.includes(column.key)}
                      onCheckedChange={() => handleColumnToggle(column.key)}
                    />
                    <Label
                      htmlFor={column.key}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {column.label}
                    </Label>
                    {visibleColumns.includes(column.key) ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Report Filters</SheetTitle>
                <SheetDescription>
                  Apply filters to refine your report data
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <Label>{filter.label}</Label>
                    {filter.type === 'select' ? (
                      <Select
                        value={activeFilters[filter.key] || ''}
                        onValueChange={(value) => handleFilterChange(filter.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${filter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : filter.type === 'date' ? (
                      <Input
                        type="date"
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      />
                    ) : filter.type === 'daterange' ? (
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="Start"
                          value={activeFilters[`${filter.key}_start`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_start`, e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="End"
                          value={activeFilters[`${filter.key}_end`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_end`, e.target.value)}
                        />
                      </div>
                    ) : (
                      <Input
                        type={filter.type}
                        placeholder={`Enter ${filter.label}`}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Advanced Settings */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Advanced
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Advanced Settings</SheetTitle>
                <SheetDescription>
                  Configure grouping, sorting, and saved views
                </SheetDescription>
              </SheetHeader>
              
              <Tabs defaultValue="grouping" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="grouping">Grouping</TabsTrigger>
                  <TabsTrigger value="sorting">Sorting</TabsTrigger>
                  <TabsTrigger value="views">Views</TabsTrigger>
                </TabsList>
                
                <TabsContent value="grouping" className="space-y-4">
                  <div>
                    <Label>Group By</Label>
                    <Select value={groupBy} onValueChange={setGroupBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field to group by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No grouping</SelectItem>
                        {columns.map((column) => (
                          <SelectItem key={column.key} value={column.key}>
                            {column.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="sorting" className="space-y-4">
                  <div>
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field to sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Default order</SelectItem>
                        {columns.map((column) => (
                          <SelectItem key={column.key} value={column.key}>
                            {column.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sort Order</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="views" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Save Current View</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="View name"
                        value={viewName}
                        onChange={(e) => setViewName(e.target.value)}
                      />
                      <Button onClick={handleSaveView} disabled={!viewName}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {savedViews.length > 0 && (
                    <div className="space-y-2">
                      <Label>Saved Views</Label>
                      {savedViews.map((view) => (
                        <div
                          key={view.id}
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted"
                          onClick={() => handleLoadView(view)}
                        >
                          <span className="text-sm">{view.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {view.columns.length} cols
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* Export Options */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Export Report</SheetTitle>
                <SheetDescription>
                  Choose a format to export your report
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('csv')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as CSV
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                  Export as Excel
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('pdf')}
                >
                  <FilePdf className="mr-2 h-4 w-4 text-red-600" />
                  Export as PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('print')}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Report Content */}
      <Card>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}