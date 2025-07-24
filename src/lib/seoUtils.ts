/**
 * SEO optimization utilities
 */

export interface SEOAnalysis {
  score: number
  issues: SEOIssue[]
  suggestions: string[]
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  field: string
}

/**
 * Analyze blog post SEO
 */
export function analyzeBlogPostSEO(post: {
  title: string
  content: string
  metaDescription?: string
  seoTitle?: string
  keywords: string[]
  slug: string
}): SEOAnalysis {
  const issues: SEOIssue[] = []
  const suggestions: string[] = []
  let score = 100

  // Title analysis
  if (!post.title) {
    issues.push({
      type: 'error',
      message: 'Title is required',
      field: 'title'
    })
    score -= 20
  } else {
    if (post.title.length < 30) {
      issues.push({
        type: 'warning',
        message: 'Title is too short (recommended: 30-60 characters)',
        field: 'title'
      })
      score -= 10
    } else if (post.title.length > 60) {
      issues.push({
        type: 'warning',
        message: 'Title is too long (recommended: 30-60 characters)',
        field: 'title'
      })
      score -= 10
    }
  }

  // SEO Title analysis
  if (post.seoTitle && post.seoTitle.length > 60) {
    issues.push({
      type: 'warning',
      message: 'SEO title is too long (recommended: under 60 characters)',
      field: 'seoTitle'
    })
    score -= 5
  }

  // Meta description analysis
  if (!post.metaDescription) {
    issues.push({
      type: 'warning',
      message: 'Meta description is missing',
      field: 'metaDescription'
    })
    suggestions.push('Add a meta description to improve search engine visibility')
    score -= 15
  } else {
    if (post.metaDescription.length < 120) {
      issues.push({
        type: 'info',
        message: 'Meta description could be longer (recommended: 120-160 characters)',
        field: 'metaDescription'
      })
      score -= 5
    } else if (post.metaDescription.length > 160) {
      issues.push({
        type: 'warning',
        message: 'Meta description is too long (recommended: 120-160 characters)',
        field: 'metaDescription'
      })
      score -= 10
    }
  }

  // Content analysis
  if (!post.content) {
    issues.push({
      type: 'error',
      message: 'Content is required',
      field: 'content'
    })
    score -= 30
  } else {
    const wordCount = post.content.split(/\s+/).length
    if (wordCount < 300) {
      issues.push({
        type: 'warning',
        message: 'Content is too short (recommended: at least 300 words)',
        field: 'content'
      })
      score -= 15
    }

    // Check for headings
    const hasHeadings = /#{1,6}\s/.test(post.content) || /<h[1-6]/.test(post.content)
    if (!hasHeadings) {
      issues.push({
        type: 'info',
        message: 'Consider adding headings to improve content structure',
        field: 'content'
      })
      suggestions.push('Use headings (H1, H2, H3) to structure your content')
      score -= 5
    }
  }

  // Keywords analysis
  if (post.keywords.length === 0) {
    issues.push({
      type: 'info',
      message: 'No keywords specified',
      field: 'keywords'
    })
    suggestions.push('Add relevant keywords to improve SEO')
    score -= 5
  } else if (post.keywords.length > 10) {
    issues.push({
      type: 'warning',
      message: 'Too many keywords (recommended: 3-5 focus keywords)',
      field: 'keywords'
    })
    score -= 5
  }

  // Slug analysis
  if (!post.slug) {
    issues.push({
      type: 'error',
      message: 'URL slug is required',
      field: 'slug'
    })
    score -= 10
  } else {
    if (post.slug.length > 50) {
      issues.push({
        type: 'warning',
        message: 'URL slug is too long (recommended: under 50 characters)',
        field: 'slug'
      })
      score -= 5
    }

    if (!/^[a-z0-9-]+$/.test(post.slug)) {
      issues.push({
        type: 'warning',
        message: 'URL slug should only contain lowercase letters, numbers, and hyphens',
        field: 'slug'
      })
      score -= 5
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score)

  return {
    score,
    issues,
    suggestions
  }
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSEOSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
}

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, count: number = 5): string[] {
  // Remove HTML tags and common words
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')

  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ])

  const words = cleanContent.split(/\s+/).filter(word => 
    word.length > 3 && !commonWords.has(word)
  )

  // Count word frequency
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([word]) => word)
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content: string, maxLength: number = 155): string {
  // Remove HTML tags and extra whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleanContent.length <= maxLength) {
    return cleanContent
  }

  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength)
  const lastSentence = truncated.lastIndexOf('.')
  
  if (lastSentence > maxLength * 0.7) {
    return cleanContent.substring(0, lastSentence + 1)
  }

  // If no good sentence break, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  return cleanContent.substring(0, lastSpace) + '...'
}

/**
 * Validate and score SEO elements
 */
export function getReadabilityScore(content: string): {
  score: number
  level: string
  suggestions: string[]
} {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

  if (sentences.length === 0 || words.length === 0) {
    return { score: 0, level: 'Unknown', suggestions: ['Add content to analyze readability'] }
  }

  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  // Flesch Reading Ease Score
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)

  let level: string
  const suggestions: string[] = []

  if (score >= 90) {
    level = 'Very Easy'
  } else if (score >= 80) {
    level = 'Easy'
  } else if (score >= 70) {
    level = 'Fairly Easy'
  } else if (score >= 60) {
    level = 'Standard'
  } else if (score >= 50) {
    level = 'Fairly Difficult'
    suggestions.push('Consider using shorter sentences and simpler words')
  } else if (score >= 30) {
    level = 'Difficult'
    suggestions.push('Break up long sentences and use more common words')
  } else {
    level = 'Very Difficult'
    suggestions.push('Significantly simplify your writing for better readability')
  }

  if (avgWordsPerSentence > 20) {
    suggestions.push('Try to keep sentences under 20 words')
  }

  return { score: Math.max(0, Math.min(100, score)), level, suggestions }
}

/**
 * Count syllables in a word (approximate)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  const vowels = word.match(/[aeiouy]+/g)
  let count = vowels ? vowels.length : 1
  
  if (word.endsWith('e')) count--
  if (word.endsWith('le') && word.length > 2) count++
  
  return Math.max(1, count)
}