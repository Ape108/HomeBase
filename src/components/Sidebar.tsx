"use client"

import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink, Info, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FREE_VERSION = true

interface SidebarProps {
  currentLayout: any;
  onLayoutChange: (layout: any) => void;
  showServiceInfo?: boolean;
  setShowServiceInfo?: (show: boolean) => void;
}

export function Sidebar({ currentLayout, onLayoutChange, showServiceInfo, setShowServiceInfo }: SidebarProps) {
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
        <div className="mt-auto pt-4">
          <a 
            href="https://github.com/Ape108" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-slate-300 hover:text-white"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.489.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
          
          <a 
            href="https://www.linkedin.com/in/cameron-akhtar-8b1226281/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center mt-2 text-slate-300 hover:text-white"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </aside>
  )
}

