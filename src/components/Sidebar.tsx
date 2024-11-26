"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Plus, LogIn, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// TODO: Replace these mock hooks with your actual authentication and workspace management logic
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const login = () => setIsLoggedIn(true)
  const logout = () => setIsLoggedIn(false)
  return { isLoggedIn, login, logout }
}

const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState(['Default Workspace'])
  const addWorkspace = () => setWorkspaces([...workspaces, `Workspace ${workspaces.length + 1}`])
  return { workspaces, addWorkspace }
}

export function Sidebar() {
  const { isLoggedIn, login, logout } = useAuth()
  const { workspaces, addWorkspace } = useWorkspaces()
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
          {isLoggedIn ? (
            <>
              <h2 className="text-sm font-semibold mb-2 text-slate-400">WORKSPACES</h2>
              <ul className="space-y-1 mb-4">
                {workspaces.map((workspace, index) => (
                  <li key={index} className="px-2 py-1 hover:bg-slate-800 rounded text-sm cursor-pointer">
                    {workspace}
                  </li>
                ))}
              </ul>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={addWorkspace}
                      className="w-full bg-slate-800 hover:bg-slate-700 border-slate-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Workspace
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add new workspace</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Log in to view your workspaces</p>
          )}
        </div>
        <div className="p-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800" 
            onClick={isLoggedIn ? logout : login}
          >
            {isLoggedIn ? (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}

// Instructions for Cursor integration:
// 1. Install required dependencies:
//    - npm install lucide-react @radix-ui/react-tooltip
// 2. Ensure you have the following components from shadcn/ui:
//    - Button
//    - Tooltip (and its subcomponents)
// 3. If you don't have shadcn/ui set up, you can create basic versions of these components
//    or replace them with your own UI components.
// 4. Replace the useAuth and useWorkspaces hooks with your actual authentication and
//    workspace management logic.
// 5. Adjust the styling classes to match your project's design system if needed.
// 6. To use the Sidebar, import it in your layout or page component:
//    import { Sidebar } from '@/components/Sidebar'
// 7. Add the Sidebar component to your layout, ensuring it's wrapped in a client-side
//    component if your app uses server-side rendering:
//    <Sidebar />

