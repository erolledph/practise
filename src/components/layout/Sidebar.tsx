import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  BookOpen,
  LogOut,
  ChevronRight,
  ChevronDown,
  Plus,
  Globe,
  Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { User } from '@/types'

interface SidebarProps {
  userData: User | null
  onLogout: () => void
  className?: string
}

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

export function Sidebar({ userData, onLogout, className }: SidebarProps) {
  const location = useLocation()
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['blog', 'products'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const baseNavItems: NavItem[] = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3
    }
  ]

  const blogNavItems: NavItem[] = [
    {
      title: 'Blog',
      icon: FileText,
      children: [
        {
          title: 'Create Blog Site',
          href: '/blog/create',
          icon: Plus
        },
        ...(userData?.blogSites || []).map(site => ({
          title: site.name,
          icon: Globe,
          children: [
            {
              title: 'Create Content',
              href: `/blog/${site.id}/create-content`,
              icon: Plus
            },
            {
              title: 'Manage Content',
              href: `/blog/${site.id}/manage-content`,
              icon: FileText
            },
            {
              title: 'Settings',
              href: `/blog/${site.id}/settings`,
              icon: Settings
            }
          ]
        }))
      ]
    }
  ]

  const productNavItems: NavItem[] = [
    {
      title: 'Products',
      icon: ShoppingCart,
      children: [
        {
          title: 'Create Product Site',
          href: '/products/create',
          icon: Plus
        },
        ...(userData?.productSites || []).map(site => ({
          title: site.name,
          icon: Store,
          children: [
            {
              title: 'Create Product',
              href: `/products/${site.id}/create-product`,
              icon: Plus
            },
            {
              title: 'Manage Products',
              href: `/products/${site.id}/manage-products`,
              icon: ShoppingCart
            },
            {
              title: 'Settings',
              href: `/products/${site.id}/settings`,
              icon: Settings
            }
          ]
        }))
      ]
    }
  ]

  const bottomNavItems: NavItem[] = [
    {
      title: 'File Manager',
      href: '/files',
      icon: FolderOpen
    },
    {
      title: 'Documentation',
      href: '/documentation',
      icon: BookOpen
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ]

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.title.toLowerCase())
    const active = item.href ? isActive(item.href) : false

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-9 px-3 transition-smooth",
              level > 0 && "ml-4 w-[calc(100%-1rem)]",
              level > 1 && "ml-8 w-[calc(100%-2rem)]"
            )}
            onClick={() => toggleSection(item.title.toLowerCase())}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto mr-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {isExpanded && (
            <div className="space-y-1 fade-in">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.title}
        variant={active ? "default" : "ghost"}
        className={cn(
          "w-full justify-start h-9 px-3 transition-smooth",
          level > 0 && "ml-4 w-[calc(100%-1rem)]",
          level > 1 && "ml-8 w-[calc(100%-2rem)]",
          active && "bg-primary text-primary-foreground shadow-sm"
        )}
        asChild
      >
        <Link to={item.href!}>
          <item.icon className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      </Button>
    )
  }

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-card shadow-sm", className)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold gradient-primary bg-clip-text text-transparent">Firebase CMS</h2>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2">
          {baseNavItems.map(item => renderNavItem(item))}
          
          <Separator className="my-4" />
          
          {blogNavItems.map(item => renderNavItem(item))}
          
          <Separator className="my-4" />
          
          {productNavItems.map(item => renderNavItem(item))}
          
          <Separator className="my-4" />
          
          {bottomNavItems.map(item => renderNavItem(item))}
        </div>
      </ScrollArea>
      
      <div className="p-3">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          className="w-full justify-start h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 transition-smooth"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}