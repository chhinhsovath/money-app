import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DatabaseService from '@/services/DatabaseService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Code,
  Play,
  Download,
  Clock,
  Database,
  AlertCircle,
  Copy,
  Save,
  History
} from 'lucide-react'

export default function SQLQuery() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const textareaRef = useRef(null)
  
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState([])

  const sampleQueries = [
    {
      name: 'Count all records',
      query: 'SELECT COUNT(*) FROM invoices'
    },
    {
      name: 'Recent invoices',
      query: 'SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10'
    },
    {
      name: 'Customer totals',
      query: `SELECT 
  c.name as customer_name,
  COUNT(i.id) as invoice_count,
  SUM(i.total) as total_amount
FROM contacts c
LEFT JOIN invoices i ON c.id = i.contact_id
WHERE c.contact_type = 'customer'
GROUP BY c.id, c.name
ORDER BY total_amount DESC`
    },
    {
      name: 'Monthly revenue',
      query: `SELECT 
  DATE_TRUNC('month', issue_date) as month,
  COUNT(*) as invoice_count,
  SUM(total) as revenue
FROM invoices
WHERE status = 'paid'
GROUP BY month
ORDER BY month DESC`
    }
  ]

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a SQL query',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await DatabaseService.executeQuery(query)
      setResult(response)
      
      // Add to history
      const historyEntry = {
        query,
        timestamp: new Date().toISOString(),
        rowCount: response.row_count,
        executionTime: response.execution_time_ms
      }
      setQueryHistory([historyEntry, ...queryHistory.slice(0, 9)])
      
      toast({
        title: 'Success',
        description: `Query executed in ${response.execution_time_ms}ms`
      })
    } catch (error) {
      toast({
        title: 'Query Error',
        description: error.error || 'Failed to execute query',
        variant: 'destructive'
      })
      
      if (error.position) {
        // Highlight error position in textarea
        const position = parseInt(error.position)
        textareaRef.current?.focus()
        textareaRef.current?.setSelectionRange(position - 1, position)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      executeQuery()
    }
  }

  const copyQuery = () => {
    navigator.clipboard.writeText(query)
    toast({
      title: 'Copied',
      description: 'Query copied to clipboard'
    })
  }

  const exportResults = () => {
    if (!result || !result.rows.length) return

    const csv = [
      Object.keys(result.rows[0]).join(','),
      ...result.rows.map(row => 
        Object.values(row).map(v => 
          typeof v === 'string' && v.includes(',') ? `"${v}"` : v
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query_results.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Success',
      description: 'Results exported as CSV'
    })
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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="h-8 w-8" />
            SQL Query Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            Execute custom SQL queries on your database
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Query Editor</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyQuery}
                    disabled={!query}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={executeQuery}
                    disabled={loading || !query}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Execute
                    <span className="ml-2 text-xs opacity-70">⌘+Enter</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="SELECT * FROM table_name..."
                className="w-full h-48 p-3 font-mono text-sm border rounded-md bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                spellCheck={false}
              />
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                Only SELECT queries are allowed for safety
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>
                      {result.row_count} row{result.row_count !== 1 ? 's' : ''} returned
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {result.execution_time_ms}ms
                    </Badge>
                    {result.rows.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportResults}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {result.rows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(result.rows[0]).map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.rows.map((row, index) => (
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
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Query executed successfully with no results
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Queries</CardTitle>
              <CardDescription>
                Click to load a sample query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleQueries.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setQuery(sample.query)}
                  >
                    {sample.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {queryHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Query History
                </CardTitle>
                <CardDescription>
                  Recent queries from this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queryHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => setQuery(entry.query)}
                    >
                      <div className="font-mono text-xs truncate">
                        {entry.query}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{entry.rowCount} rows</span>
                        <span>•</span>
                        <span>{entry.executionTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}