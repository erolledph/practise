import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-6xl font-bold gradient-primary bg-clip-text text-transparent">404</CardTitle>
          <p className="text-xl font-semibold text-foreground">Page Not Found</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="default" className="btn-primary">
              <Link to="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="transition-smooth" onClick={() => window.history.back()}>
              <span>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}