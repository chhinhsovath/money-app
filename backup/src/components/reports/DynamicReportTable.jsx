import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DynamicReportTable({
  data = [],
  columns = [],
  visibleColumns = [],
  groupBy,
  sortBy,
  sortOrder = 'asc',
  onRowClick,
  getRowClassName,
  renderCell,
  showTotals = false,
  totalLabel = 'Total',
  calculateTotals
}) {
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  // Filter columns based on visibility
  const displayColumns = columns.filter(col => visibleColumns.includes(col.key))

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      
      if (sortOrder === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
      }
    })
  }, [data, sortBy, sortOrder])

  // Group data
  const groupedData = useMemo(() => {
    if (!groupBy) return { '': sortedData }

    const groups = {}
    sortedData.forEach(row => {
      const groupValue = row[groupBy] || 'Uncategorized'
      if (!groups[groupValue]) {
        groups[groupValue] = []
      }
      groups[groupValue].push(row)
    })
    
    return groups
  }, [sortedData, groupBy])

  // Calculate totals
  const totals = useMemo(() => {
    if (!showTotals) return null

    if (calculateTotals) {
      return calculateTotals(data, displayColumns)
    }

    const totals = {}
    displayColumns.forEach(col => {
      if (col.type === 'number' || col.type === 'currency') {
        totals[col.key] = data.reduce((sum, row) => {
          const value = row[col.key]
          return sum + (typeof value === 'number' ? value : 0)
        }, 0)
      }
    })
    
    return totals
  }, [data, displayColumns, showTotals, calculateTotals])

  const toggleGroup = (groupName) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName)
    } else {
      newExpanded.add(groupName)
    }
    setExpandedGroups(newExpanded)
  }

  const formatCellValue = (value, column) => {
    if (renderCell) {
      const customRender = renderCell(value, column)
      if (customRender !== undefined) return customRender
    }

    if (value === null || value === undefined) return '-'
    
    if (column.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    }
    
    if (column.type === 'number') {
      return new Intl.NumberFormat('en-US').format(value)
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString()
    }
    
    if (column.type === 'percentage') {
      return `${(value * 100).toFixed(2)}%`
    }
    
    return value
  }

  const renderGroupedData = () => {
    return Object.entries(groupedData).map(([groupName, groupRows]) => {
      const isExpanded = !groupBy || expandedGroups.has(groupName)
      
      return (
        <React.Fragment key={groupName}>
          {groupBy && (
            <TableRow 
              className="bg-muted/50 cursor-pointer hover:bg-muted"
              onClick={() => toggleGroup(groupName)}
            >
              <TableCell colSpan={displayColumns.length} className="font-medium">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>{groupName}</span>
                  <span className="text-muted-foreground">({groupRows.length})</span>
                </div>
              </TableCell>
            </TableRow>
          )}
          
          {isExpanded && groupRows.map((row, index) => (
            <TableRow
              key={row.id || index}
              className={cn(
                "hover:bg-muted/50 cursor-pointer",
                getRowClassName && getRowClassName(row)
              )}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {displayColumns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center'
                  )}
                >
                  {formatCellValue(row[column.key], column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          
          {groupBy && showTotals && isExpanded && (
            <TableRow className="bg-muted/30 font-medium">
              {displayColumns.map((column, index) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center'
                  )}
                >
                  {index === 0 ? 
                    `${groupName} Total` : 
                    column.type === 'number' || column.type === 'currency' ?
                      formatCellValue(
                        groupRows.reduce((sum, row) => sum + (row[column.key] || 0), 0),
                        column
                      ) : ''
                  }
                </TableCell>
              ))}
            </TableRow>
          )}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {displayColumns.map((column) => (
              <TableHead 
                key={column.key}
                className={cn(
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  column.className
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderGroupedData()}
          
          {showTotals && totals && (
            <TableRow className="bg-muted font-bold border-t-2">
              {displayColumns.map((column, index) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center'
                  )}
                >
                  {index === 0 ? 
                    totalLabel : 
                    totals[column.key] !== undefined ?
                      formatCellValue(totals[column.key], column) : ''
                  }
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}