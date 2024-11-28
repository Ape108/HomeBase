"use client"

import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink, LogOut, User } from 'lucide-react'
import { getAvailableAccounts } from '@/services/googleApi'

const FREE_VERSION = true

interface User {
  picture?: string;
  name: string;
  email: string;
}

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const accounts = getAvailableAccounts()
    if (accounts && accounts.length > 0) {
      setCurrentUser(accounts[0])
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarRef.current) {
        const sidebarWidth = 256 // w-64
        const triggerZone = 40
        
        if (e.clientX <= triggerZone) {
          setIsExpanded(true)
        } else if (e.clientX > sidebarWidth) {
          setIsExpanded(false)
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <aside 
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white border-r border-slate-800 transition-transform duration-300 ease-in-out z-50 ${
        isExpanded ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <h1 className="text-xl font-bold mb-6">HomeBase</h1>
          <div className="space-y-2">
            <a 
              href="/legal/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded text-sm text-slate-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
              Privacy Policy
            </a>
            <a 
              href="/legal/terms-of-service.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded text-sm text-slate-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
              Terms of Service
            </a>
            <a 
              href="/legal/readme.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded text-sm text-slate-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
              README
            </a>
          </div>
        </div>

        {currentUser && (
          <div className="p-4 border-t border-slate-800 mt-auto">
            <div className="flex items-center gap-3 mb-3">
              {currentUser.picture ? (
                <img 
                  src={currentUser.picture} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentUser.name}</p>
                <p className="text-sm text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-300 
                hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

