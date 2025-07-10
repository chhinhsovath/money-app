import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DatabaseService from '@/services/DatabaseService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Database,
  Table as TableIcon,
  Search,
  Activity,
  HardDrive,
  Layers,
  Key,
  TrendingUp,
  RefreshCw,
  FileDown,
  Code,
  GitBranch
} from 'lucide-react'

export default function DatabaseTables() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tables, setTables] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tablesData, statsData] = await Promise.all([
        DatabaseService.getTables(),
        DatabaseService.getStatistics()
      ])
      setTables(tablesData)
      setStatistics(statsData)
    } catch (error) {
      console.error('Error loading database data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load database information',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
    toast({
      title: 'Success',
      description: 'Database information refreshed'
    })
  }

  const filteredTables = tables.filter(table =>
    table.tablename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              Database Tables
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore and manage your database structure
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/database/query')}
            >
              <Code className="mr-2 h-4 w-4" />
              SQL Query
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/database/migrations')}
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Migrations
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {statistics && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.database.size_pretty}</div>
              <p className="text-xs text-muted-foreground mt-1">Total storage used</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tables.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Public schema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(tables.reduce((sum, t) => sum + t.row_count, 0))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.connections.active_connections} / {statistics.connections.total_connections}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active / Total</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tables</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Indexes</TableHead>
                <TableHead>Triggers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => (
                <TableRow key={table.tablename}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <TableIcon className="h-4 w-4 text-muted-foreground" />
                      {table.tablename}
                    </div>
                  </TableCell>
                  <TableCell>{formatNumber(table.row_count)}</TableCell>
                  <TableCell>{table.size}</TableCell>
                  <TableCell>
                    {table.hasindexes ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Key className="h-3 w-3" />
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {table.hastriggers ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Activity className="h-3 w-3" />
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/database/tables/${table.tablename}`)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {statistics && statistics.largest_tables.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Largest Tables
            </CardTitle>
            <CardDescription>
              Top 10 tables by storage size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statistics.largest_tables.map((table, index) => (
                <div key={table.tablename} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <span className="font-medium">{table.tablename}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatNumber(table.row_count)} rows
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{table.size}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}