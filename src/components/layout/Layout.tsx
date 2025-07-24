import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/hooks/useAuth'

export function Layout() {
  const { userData, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Header userData={userData} onLogout={logout} />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar userData={userData} onLogout={logout} />
        </div>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}