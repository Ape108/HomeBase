"use client"

import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'

const FREE_VERSION = true

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

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
      </div>
    </aside>
  )
}

