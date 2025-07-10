import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DatabaseService from '@/services/DatabaseService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Database,
  Table as TableIcon,
  Columns,
  Key,
  FileText,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react'

export default function TableView() {
  const { tableName } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [structure, setStructure] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  
  // Data browsing state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('ASC')
  const [filterText, setFilterText] = useState('')

  useEffect(() => {
    loadTableStructure()
  }, [tableName])

  useEffect(() => {
    loadTableData()
  }, [currentPage, pageSize, sortBy, sortOrder, filterText])

  const loadTableStructure = async () => {
    try {
      const structureData = await DatabaseService.getTableStructure(tableName)
      setStructure(structureData)
    } catch (error) {
      console.error('Error loading table structure:', error)
      toast({
        title: 'Error',
        description: 'Failed to load table structure',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTableData = async () => {
    setDataLoading(true)
    try {
      const tableData = await DatabaseService.getTableData(tableName, {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        filter: filterText
      })
      setData(tableData)
    } catch (error) {
      console.error('Error loading table data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load table data',
        variant: 'destructive'
      })
    } finally {
      setDataLoading(false)
    }
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(column)
      setSortOrder('ASC')
    }
    setCurrentPage(1)
  }

  const handleExport = async (format) => {
    try {
      const allData = await DatabaseService.getTableData(tableName, {
        page: 1,
        limit: 10000,
        sortBy,
        sortOrder,
        filter: filterText
      })

      let content = ''
      let filename = `${tableName}_export.${format}`
      let mimeType = ''

      if (format === 'csv') {
        const headers = Object.keys(allData.data[0] || {})
        content = headers.join(',') + '\n'
        content += allData.data.map(row => 
          headers.map(h => JSON.stringify(row[h] || '')).join(',')
        ).join('\n')
        mimeType = 'text/csv'
      } else if (format === 'json') {
        content = JSON.stringify(allData.data, null, 2)
        mimeType = 'application/json'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: `Table data exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      })
    }
  }

  const getDataTypeIcon = (dataType) => {
    if (dataType.includes('int')) return '🔢'
    if (dataType.includes('char') || dataType.includes('text')) return '📝'
    if (dataType.includes('date') || dataType.includes('time')) return '📅'
    if (dataType.includes('bool')) return '✓'
    if (dataType.includes('json')) return '{}'
    if (dataType.includes('numeric') || dataType.includes('decimal')) return '💰'
    return '📊'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/database')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tables
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TableIcon className="h-8 w-8" />
              {tableName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Table structure and data browser
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Columns className="h-4 w-4" />
            Structure
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Browse Data
          </TabsTrigger>
          <TabsTrigger value="indexes" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Indexes & Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Table Columns</CardTitle>
              <CardDescription>
                Column definitions and data types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column Name</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Max Length</TableHead>
                    <TableHead>Nullable</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structure?.columns.map((column) => (
                    <TableRow key={column.column_name}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{getDataTypeIcon(column.data_type)}</span>
                          {column.column_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{column.data_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {column.character_maximum_length || '-'}
                      </TableCell>
                      <TableCell>
                        {column.is_nullable === 'YES' ? (
                          <Badge variant="secondary">Yes</Badge>
                        ) : (
                          <Badge variant="destructive">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {column.column_default || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {structure?.constraints.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {structure.constraints.map((constraint) => (
                    <div key={constraint.constraint_name} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{constraint.constraint_name}</span>
                        <Badge variant="outline" className="ml-2">
                          {constraint.constraint_type === 'p' && 'PRIMARY KEY'}
                          {constraint.constraint_type === 'f' && 'FOREIGN KEY'}
                          {constraint.constraint_type === 'u' && 'UNIQUE'}
                          {constraint.constraint_type === 'c' && 'CHECK'}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{constraint.definition}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Table Data</CardTitle>
                  <CardDescription>
                    Browse and search table records
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={filterText}
                      onChange={(e) => {
                        setFilterText(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : data?.data.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(data.data[0]).map((column) => (
                            <TableHead key={column}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleSort(column)}
                              >
                                {column}
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                              </Button>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.data.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <TableCell key={cellIndex} className="max-w-xs truncate">
                                {value === null ? (
                                  <span className="text-muted-foreground">NULL</span>
                                ) : typeof value === 'boolean' ? (
                                  <Badge variant={value ? 'default' : 'secondary'}>
                                    {value.toString()}
                                  </Badge>
                                ) : (
                                  value.toString()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.pagination.total_rows)} of {data.pagination.total_rows} records
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= data.pagination.total_pages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexes">
          <Card>
            <CardHeader>
              <CardTitle>Indexes</CardTitle>
              <CardDescription>
                Table indexes for performance optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {structure?.indexes.length > 0 ? (
                <div className="space-y-2">
                  {structure.indexes.map((index) => (
                    <div key={index.indexname} className="p-3 border rounded">
                      <div className="font-medium flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        {index.indexname}
                      </div>
                      <pre className="text-sm text-muted-foreground mt-1 overflow-x-auto">
                        {index.indexdef}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No indexes defined</p>
              )}
            </CardContent>
          </Card>

          {structure?.foreign_keys.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Foreign Keys</CardTitle>
                <CardDescription>
                  Relationships to other tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {structure.foreign_keys.map((fk) => (
                    <div key={fk.constraint_name} className="p-3 border rounded">
                      <div className="font-medium">{fk.constraint_name}</div>
                      <div className="text-sm mt-1">
                        <span className="text-muted-foreground">Column: </span>
                        <span className="font-medium">{fk.column_name}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="font-medium">{fk.foreign_table_name}.{fk.foreign_column_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}