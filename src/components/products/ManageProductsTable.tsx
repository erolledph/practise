import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Trash2, Eye, Plus, Search, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchInput } from '@/components/common/SearchInput'
import { ConfirmDialog, useConfirmDialog } from '@/components/common/ConfirmDialog'
import { ExportDialog } from '@/components/common/ExportDialog'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { useSearch } from '@/hooks/useSearch'
import { getProducts, deleteDocument } from '@/lib/firebase-admin'
import { formatDate, formatPrice } from '@/lib/utils'
import { Product } from '@/types'

export function ManageProductsTable() {
  const { siteId } = useParams<{ siteId: string }>()
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const { success, error } = useToastContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { showConfirm, ConfirmDialog } = useConfirmDialog()

  const productSite = userData?.productSites?.find(site => site.id === siteId)

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filteredItems: filteredProducts,
    isSearching
  } = useSearch(products, {
    keys: ['name', 'category', 'tags'],
    threshold: 0.3
  })

  useEffect(() => {
    loadProducts()
  }, [user, siteId])

  const loadProducts = async () => {
    if (!user || !siteId) return

    try {
      const productList = await getProducts(user.uid, siteId)
      setProducts(productList)
    } catch (err) {
      console.error('Error loading products:', err)
      error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return

    try {
      await deleteDocument(user.uid, 'products', productId)
      setProducts(prev => prev.filter(product => product.id !== productId))
      setSelectedProducts(prev => prev.filter(id => id !== productId))
      success('Product deleted successfully')
    } catch (err) {
      console.error('Error deleting product:', err)
      error('Failed to delete product')
    }
  }

  const handleBulkDelete = async () => {
    if (!user || selectedProducts.length === 0) return

    try {
      await Promise.all(
        selectedProducts.map(productId => deleteDocument(user.uid, 'products', productId))
      )
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)))
      setSelectedProducts([])
      success(`${selectedProducts.length} products deleted successfully`)
    } catch (err) {
      console.error('Error deleting products:', err)
      error('Failed to delete selected products')
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedProducts(prev =>
      prev.length === displayedProducts.length ? [] : displayedProducts.map(product => product.id)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'status-published'
      case 'draft':
        return 'status-draft'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Apply status filter
  const displayedProducts = filteredProducts.filter(product => 
    statusFilter === 'all' || product.status === statusFilter
  )

  if (!productSite) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Product site not found</h3>
        <p className="text-muted-foreground">The requested product site could not be found.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Manage Products</h1>
        <p className="dashboard-subtitle">
          Manage products for "{productSite.name}"
        </p>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products ({displayedProducts.length})</CardTitle>
            <div className="flex gap-2">
              {selectedProducts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => showConfirm({
                    title: 'Delete Selected Products',
                    description: `Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`,
                    confirmText: 'Delete Products',
                    variant: 'destructive',
                    onConfirm: handleBulkDelete
                  })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedProducts.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                disabled={products.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={() => navigate(`/products/${siteId}/create-product`)}
                className="btn-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search products by name, category, or tags..."
                isSearching={isSearching}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' ? (
                  <Search className="h-12 w-12" />
                ) : (
                  <Plus className="h-12 w-12" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Add your first product to get started.'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => navigate(`/products/${siteId}/create-product`)}
                  className="btn-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === displayedProducts.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">/{product.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium price-display">
                            {formatPrice(product.price, product.currency)}
                          </p>
                          {product.originalPrice > product.price && (
                            <div className="flex items-center gap-2">
                              <span className="price-original">
                                {formatPrice(product.originalPrice, product.currency)}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                {product.percentOff}% off
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.category && (
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(product.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.productUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(product.productUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/products/${siteId}/edit-product/${product.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => showConfirm({
                              title: 'Delete Product',
                              description: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
                              confirmText: 'Delete Product',
                              variant: 'destructive',
                              onConfirm: () => handleDeleteProduct(product.id)
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={products}
        type="product"
        siteName={productSite.name}
      />
    </div>
  )
}