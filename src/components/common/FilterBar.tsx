import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from './SearchInput'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  filters: FilterConfig[]
  onClearAll?: () => void
  isSearching?: boolean
  className?: string
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  onClearAll,
  isSearching = false,
  className
}: FilterBarProps) {
  const hasActiveFilters = filters.some(filter => filter.value !== 'all') || searchQuery

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            isSearching={isSearching}
          />
        </div>
        
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          
          {hasActiveFilters && onClearAll && (
            <Button variant="outline" onClick={onClearAll}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="outline" className="gap-1">
              Search: "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.map((filter) => 
            filter.value !== 'all' && (
              <Badge key={filter.key} variant="outline" className="gap-1">
                {filter.label}: {filter.options.find(opt => opt.value === filter.value)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => filter.onChange('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          )}
        </div>
      )}
    </div>
  )
}