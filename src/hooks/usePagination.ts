import { useState, useMemo } from 'react'

export interface PaginationOptions {
  initialPage?: number
  itemsPerPage?: number
}

export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
) {
  const { initialPage = 1, itemsPerPage = 25 } = options
  const [currentPage, setCurrentPage] = useState(initialPage)

  const paginationData = useMemo(() => {
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const currentItems = items.slice(startIndex, endIndex)

    return {
      currentItems,
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      startIndex: startIndex + 1,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationData.totalPages))
    setCurrentPage(validPage)
  }

  const goToNextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const goToPreviousPage = () => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(paginationData.totalPages)

  return {
    ...paginationData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage
  }
}