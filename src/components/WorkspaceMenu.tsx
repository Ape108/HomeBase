import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { FolderOpen, Plus, Minus, Pencil } from 'lucide-react'
import { workspaceService } from '@/services/workspaceService'
import type { Workspace } from '@/types/workspace'

interface WorkspaceMenuProps {
  userId: string;
  currentLayout: {
    [key: string]: {
      position: string;
      documentId?: string;
      documentName?: string;
      documentType?: string;
      zoom?: number;
      mode?: 'read' | 'write';
      width?: string;
    };
  };
  onWorkspaceLoad: (workspace: Workspace) => void;
}

export function WorkspaceMenu({ userId, currentLayout, onWorkspaceLoad }: WorkspaceMenuProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    console.log('Loading workspaces for user:', userId)
    try {
      setIsLoading(true)
      const workspaces = await workspaceService.getUserWorkspaces(userId)
      console.log('Loaded workspaces:', workspaces)
      setWorkspaces(workspaces)
    } catch (error) {
      console.error('Error loading workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWorkspace = async () => {
    const name = prompt('Enter workspace name:')
    if (!name) return

    try {
      setIsLoading(true)
      const workspace = await workspaceService.createWorkspace(name, userId, [])
      console.log('✅ Workspace created:', workspace)
      await loadWorkspaces()
    } catch (error) {
      console.error('❌ Error creating workspace:', error)
      alert('Failed to create workspace')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditName = async (workspaceId: string, currentName: string) => {
    setEditingWorkspace(workspaceId)
    setEditName(currentName)
  }

  const handleSaveName = async (workspaceId: string) => {
    if (!editName.trim()) return

    try {
      setIsLoading(true)
      await workspaceService.updateWorkspace(workspaceId, { name: editName })
      console.log('✅ Workspace name updated')
      await loadWorkspaces()
    } catch (error) {
      console.error('❌ Error updating workspace name:', error)
      alert('Failed to update workspace name')
    } finally {
      setIsLoading(false)
      setEditingWorkspace(null)
    }
  }

  const handleDeleteWorkspace = async (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this workspace?')) {
      try {
        setIsLoading(true)
        await workspaceService.deleteWorkspace(workspaceId)
        console.log('✅ Workspace deleted successfully')
        await loadWorkspaces()
      } catch (error) {
        console.error('❌ Error deleting workspace:', error)
        alert('Failed to delete workspace')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="absolute top-4 right-4 z-50">
      <Card className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadWorkspaces}
              disabled={isLoading}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              <span>Workspaces</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuItem
              onClick={handleCreateWorkspace}
              className="flex items-center gap-2 p-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Workspace</span>
            </DropdownMenuItem>
            
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => onWorkspaceLoad(workspace)}
              >
                {editingWorkspace === workspace.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter') handleSaveName(workspace.id)
                      if (e.key === 'Escape') setEditingWorkspace(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="px-2 py-1 bg-background border rounded"
                  />
                ) : (
                  <span>{workspace.name}</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditName(workspace.id, workspace.name)
                    }}
                    className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                    className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <Minus className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))}
            {workspaces.length === 0 && (
              <DropdownMenuItem disabled>
                No workspaces found
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </div>
  )
} 