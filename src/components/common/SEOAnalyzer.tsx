import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Target,
  FileText,
  Hash,
  Link
} from 'lucide-react'
import { analyzeBlogPostSEO, getReadabilityScore, SEOAnalysis, SEOIssue } from '@/lib/seoUtils'

interface SEOAnalyzerProps {
  title: string
  content: string
  metaDescription?: string
  seoTitle?: string
  keywords: string[]
  slug: string
  onSuggestionApply?: (field: string, value: string) => void
}

export function SEOAnalyzer({
  title,
  content,
  metaDescription,
  seoTitle,
  keywords,
  slug,
  onSuggestionApply
}: SEOAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [readability, setReadability] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    analyzeContent()
  }, [title, content, metaDescription, seoTitle, keywords, slug])

  const analyzeContent = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate analysis delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const seoAnalysis = analyzeBlogPostSEO({
        title,
        content,
        metaDescription,
        seoTitle,
        keywords,
        slug
      })
      
      const readabilityScore = getReadabilityScore(content)
      
      setAnalysis(seoAnalysis)
      setReadability(readabilityScore)
    } catch (error) {
      console.error('SEO analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const getIssueIcon = (type: SEOIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getIssueVariant = (type: SEOIssue['type']) => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      default:
        return 'default'
    }
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Analyzing SEO...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis || !readability) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to analyze content. Please try again.</p>
          <Button onClick={analyzeContent} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </div>
            <div className="flex-1">
              <Progress value={analysis.score} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {analysis.score >= 80 ? 'Excellent' : 
                 analysis.score >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readability Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Readability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-semibold ${getScoreColor(readability.score)}`}>
              {Math.round(readability.score)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{readability.level}</p>
              <Progress value={readability.score} className="h-2 mt-1" />
            </div>
          </div>
          {readability.suggestions.length > 0 && (
            <div className="mt-3 space-y-1">
              {readability.suggestions.map((suggestion: string, index: number) => (
                <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Issues Found ({analysis.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.issues.map((issue, index) => (
              <Alert key={index} variant={getIssueVariant(issue.type)}>
                <div className="flex items-start gap-2">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <AlertDescription>
                      <span className="font-medium capitalize">{issue.field}:</span> {issue.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                <Info className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Content Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{content.split(/\s+/).length}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{title.length}</div>
              <div className="text-sm text-muted-foreground">Title Length</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metaDescription?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Meta Desc</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{keywords.length}</div>
              <div className="text-sm text-muted-foreground">Keywords</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            URL Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="font-mono text-sm bg-muted p-2 rounded">
              https://yoursite.com/blog/{slug}
            </div>
            <div className="text-sm text-muted-foreground">
              URL length: {slug.length} characters
              {slug.length > 50 && (
                <Badge variant="destructive" className="ml-2">Too long</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}