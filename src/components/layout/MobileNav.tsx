import React from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { User } from '@/types'

interface MobileNavProps {
  userData: User | null
  onLogout: () => void
}

export function MobileNav({ userData, onLogout }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar 
            userData={userData} 
            onLogout={() => {
              onLogout()
              setOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}