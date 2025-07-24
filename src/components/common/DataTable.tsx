import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  selectedItems?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  getItemId: (item: T) => string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  selectedItems = [],
  onSelectionChange,
  getItemId,
  sortBy,
  sortDirection,
  onSort,
  emptyMessage = 'No data available',
  className
}: DataTableProps<T>) {
  const isAllSelected = selectedItems.length === data.length && data.length > 0
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < data.length

  const toggleSelectAll = () => {
    if (!onSelectionChange) return
    
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(data.map(getItemId))
    }
  }

  const toggleSelectItem = (itemId: string) => {
    if (!onSelectionChange) return
    
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    } else {
      onSelectionChange([...selectedItems, itemId])
    }
  }

  const handleSort = (key: string) => {
    if (!onSort) return
    onSort(key)
  }

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const getCellValue = (item: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(item)
    }
    
    const value = item[column.key as keyof T]
    
    if (value === null || value === undefined) {
      return '-'
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    
    return String(value)
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('table-responsive', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key as string}
                className={cn(column.className)}
                style={{ width: column.width }}
              >
                {column.sortable && onSort ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(column.key as string)}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    {column.header}
                    {getSortIcon(column.key as string)}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const itemId = getItemId(item)
            const isSelected = selectedItems.includes(itemId)
            
            return (
              <TableRow key={itemId} className={isSelected ? 'bg-muted/50' : ''}>
                {onSelectionChange && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectItem(itemId)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key as string}
                    className={column.className}
                  >
                    {getCellValue(item, column)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}