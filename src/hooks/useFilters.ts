import { useState, useMemo } from 'react'

export interface FilterConfig<T> {
  key: keyof T
  type: 'select' | 'multiselect' | 'range' | 'date'
  options?: Array<{ value: string; label: string }>
  defaultValue?: any
}

export function useFilters<T>(
  items: T[],
  configs: FilterConfig<T>[]
) {
  const [filters, setFilters] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    configs.forEach(config => {
      initial[config.key as string] = config.defaultValue || (config.type === 'multiselect' ? [] : '')
    })
    return initial
  })

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return configs.every(config => {
        const filterValue = filters[config.key as string]
        const itemValue = item[config.key]

        if (!filterValue || filterValue === 'all' || filterValue === '') {
          return true
        }

        switch (config.type) {
          case 'select':
            return itemValue === filterValue

          case 'multiselect':
            if (Array.isArray(filterValue) && filterValue.length === 0) {
              return true
            }
            if (Array.isArray(itemValue)) {
              return filterValue.some((fv: any) => itemValue.includes(fv))
            }
            return filterValue.includes(itemValue)

          case 'range':
            if (typeof itemValue === 'number' && Array.isArray(filterValue)) {
              const [min, max] = filterValue
              return itemValue >= min && itemValue <= max
            }
            return true

          case 'date':
            if (itemValue instanceof Date && filterValue instanceof Date) {
              return itemValue >= filterValue
            }
            return true

          default:
            return true
        }
      })
    })
  }, [items, filters, configs])

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilter = (key: string) => {
    const config = configs.find(c => c.key === key)
    const defaultValue = config?.defaultValue || (config?.type === 'multiselect' ? [] : '')
    updateFilter(key, defaultValue)
  }

  const clearAllFilters = () => {
    const clearedFilters: Record<string, any> = {}
    configs.forEach(config => {
      clearedFilters[config.key as string] = config.defaultValue || (config.type === 'multiselect' ? [] : '')
    })
    setFilters(clearedFilters)
  }

  const hasActiveFilters = useMemo(() => {
    return configs.some(config => {
      const value = filters[config.key as string]
      const defaultValue = config.defaultValue || (config.type === 'multiselect' ? [] : '')
      
      if (Array.isArray(value) && Array.isArray(defaultValue)) {
        return value.length !== defaultValue.length
      }
      
      return value !== defaultValue && value !== 'all' && value !== ''
    })
  }, [filters, configs])

  return {
    filters,
    filteredItems,
    updateFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters
  }
}