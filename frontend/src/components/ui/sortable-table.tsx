import { useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | null

export type SortState<T extends string> = {
  column: T | null
  direction: SortDirection
}

type SortableTableHeadProps<T extends string> = {
  column: T
  currentSort: SortState<T>
  onSort: (column: T) => void
  children: React.ReactNode
  className?: string
}

export function SortableTableHead<T extends string>({
  column,
  currentSort,
  onSort,
  children,
  className,
}: SortableTableHeadProps<T>) {
  const isActive = currentSort.column === column
  const direction = isActive ? currentSort.direction : null

  return (
    <TableHead
      className={cn('cursor-pointer select-none hover:bg-muted/50 transition-colors', className)}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <span className="ml-1">
          {direction === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5" />
          ) : direction === 'desc' ? (
            <ArrowDown className="w-3.5 h-3.5" />
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />
          )}
        </span>
      </div>
    </TableHead>
  )
}

export function useSorting<T extends string>(defaultColumn?: T, defaultDirection: SortDirection = 'asc') {
  const [sort, setSort] = useState<SortState<T>>({
    column: defaultColumn ?? null,
    direction: defaultColumn ? defaultDirection : null,
  })

  const handleSort = (column: T) => {
    setSort((prev) => {
      if (prev.column !== column) {
        return { column, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' }
      }
      return { column: null, direction: null }
    })
  }

  return { sort, handleSort }
}

export function sortData<T, K extends string>(
  data: T[],
  sort: SortState<K>,
  getters: Record<K, (item: T) => string | number | null | undefined>
): T[] {
  if (!sort.column || !sort.direction) return data

  const getter = getters[sort.column]
  if (!getter) return data

  return [...data].sort((a, b) => {
    const aVal = getter(a)
    const bVal = getter(b)

    // Handle nulls - put them at the end
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Compare
    let comparison = 0
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else {
      comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    }

    return sort.direction === 'desc' ? -comparison : comparison
  })
}
