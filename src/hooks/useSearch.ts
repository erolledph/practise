import { useState, useMemo } from 'react'
import { useDebounce } from './useDebounce'

export interface SearchOptions<T> {
  keys: (keyof T)[]
  threshold?: number
  caseSensitive?: boolean
}

export function useSearch<T>(
  items: T[],
  options: SearchOptions<T>
) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items
    }

    const searchTerm = options.caseSensitive 
      ? debouncedQuery 
      : debouncedQuery.toLowerCase()

    return items.filter(item => {
      return options.keys.some(key => {
        const value = item[key]
        if (typeof value !== 'string') return false
        
        const searchValue = options.caseSensitive 
          ? value 
          : value.toLowerCase()
        
        return searchValue.includes(searchTerm)
      })
    })
  }, [items, debouncedQuery, options])

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text
    
    const regex = new RegExp(`(${highlight})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  return {
    query,
    setQuery,
    filteredItems,
    highlightMatch,
    isSearching: query !== debouncedQuery
  }
}