import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Trash2, Eye, Plus, Search, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchInput } from '@/components/common/SearchInput'
import { useConfirmDialog } from '@/components/common/ConfirmDialog'
import { ExportDialog } from '@/components/common/ExportDialog'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { useSearch } from '@/hooks/useSearch'
import { getBlogPosts, deleteDocument } from '@/lib/firebase-admin'
import { formatDate } from '@/lib/utils'
import { BlogPost } from '@/types'

export function ManageBlogPostsTable() {
  const { siteId } = useParams<{ siteId: string }>()
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const { success, error } = useToastContext()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { showConfirm, ConfirmDialog } = useConfirmDialog()

  const blogSite = userData?.blogSites?.find(site => site.id === siteId)

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filteredItems: filteredPosts,
    isSearching
  } = useSearch(posts, {
    keys: ['title', 'author', 'categories', 'tags'],
    threshold: 0.3
  })

  useEffect(() => {
    loadPosts()
  }, [user, siteId])

  const loadPosts = async () => {
    if (!user || !siteId) return

    try {
      const blogPosts = await getBlogPosts(user.uid, siteId)
      setPosts(blogPosts)
    } catch (err) {
      console.error('Error loading blog posts:', err)
      error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) return

    try {
      await deleteDocument(user.uid, 'blogPosts', postId)
      setPosts(prev => prev.filter(post => post.id !== postId))
      setSelectedPosts(prev => prev.filter(id => id !== postId))
      success('Blog post deleted successfully')
    } catch (err) {
      console.error('Error deleting post:', err)
      error('Failed to delete blog post')
    }
  }

  const handleBulkDelete = async () => {
    if (!user || selectedPosts.length === 0) return

    try {
      await Promise.all(
        selectedPosts.map(postId => deleteDocument(user.uid, 'blogPosts', postId))
      )
      setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)))
      setSelectedPosts([])
      success(`${selectedPosts.length} blog posts deleted successfully`)
    } catch (err) {
      console.error('Error deleting posts:', err)
      error('Failed to delete selected blog posts')
    }
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedPosts(prev =>
      prev.length === displayedPosts.length ? [] : displayedPosts.map(post => post.id)
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
  const displayedPosts = filteredPosts.filter(post => 
    statusFilter === 'all' || post.status === statusFilter
  )

  if (!blogSite) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Blog site not found</h3>
        <p className="text-muted-foreground">The requested blog site could not be found.</p>
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
        <h1 className="dashboard-title">Manage Blog Posts</h1>
        <p className="dashboard-subtitle">
          Manage content for "{blogSite.name}"
        </p>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blog Posts ({displayedPosts.length})</CardTitle>
            <div className="flex gap-2">
              {selectedPosts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => showConfirm({
                    title: 'Delete Selected Posts',
                    description: `Are you sure you want to delete ${selectedPosts.length} selected blog posts? This action cannot be undone.`,
                    confirmText: 'Delete Posts',
                    variant: 'destructive',
                    onConfirm: handleBulkDelete
                  })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedPosts.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                disabled={posts.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={() => navigate(`/blog/${siteId}/create-content`)}
                className="btn-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Post
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
                placeholder="Search posts by title, author, categories, or tags..."
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

          {displayedPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' ? (
                  <Search className="h-12 w-12" />
                ) : (
                  <Plus className="h-12 w-12" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No posts found' : 'No blog posts yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first blog post to get started.'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => navigate(`/blog/${siteId}/create-content`)}
                  className="btn-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Post
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
                        checked={selectedPosts.length === displayedPosts.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPosts.includes(post.id)}
                          onCheckedChange={() => togglePostSelection(post.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground">/{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.categories.slice(0, 2).map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {post.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.contentUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(post.contentUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/blog/${siteId}/edit-content/${post.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => showConfirm({
                              title: 'Delete Blog Post',
                              description: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
                              confirmText: 'Delete Post',
                              variant: 'destructive',
                              onConfirm: () => handleDeletePost(post.id)
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
        data={posts}
        type="blog"
        siteName={blogSite.name}
      />
    </div>
  )
}