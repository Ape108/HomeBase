import { supabase } from '@/lib/supabase'
import { authService } from './authService'

export const workspaceService = {
  async createWorkspace(name, userId, panels = []) {
    console.log('Creating workspace with:', { name, userId, panels })
    try {
      const session = await authService.getCurrentSession()
      if (!session) throw new Error('No active session')

      // First create the workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([{ 
          name, 
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (workspaceError) {
        console.error('Workspace creation error:', workspaceError)
        throw workspaceError
      }

      console.log('Created workspace:', workspace)

      if (panels.length > 0) {
        // Then create the panels with document data
        const panelsData = panels.map(panel => ({
          workspace_id: workspace.id,
          position: panel.position,
          document_id: panel.documentId,
          document_name: panel.documentName,
          document_type: panel.documentType,
          document_access_token: panel.document_access_token,
          document_refresh_token: panel.document_refresh_token,
          document_expiry: panel.document_expiry,
          zoom: panel.zoom || 1,
          mode: panel.mode || 'read',
          created_at: new Date().toISOString()
        }))

        console.log('Creating panels with document data:', panelsData)

        const { data: savedPanels, error: panelsError } = await supabase
          .from('panels')
          .insert(panelsData)
          .select()

        if (panelsError) {
          console.error('Panels creation error:', panelsError)
          throw panelsError
        }

        console.log('Created panels:', savedPanels)
        return { ...workspace, panels: savedPanels }
      }

      return { ...workspace, panels: [] }
    } catch (error) {
      console.error('Error in createWorkspace:', error)
      throw error
    }
  },

  async getUserWorkspaces(userId) {
    console.log('Fetching workspaces for user:', userId)
    try {
      const session = await authService.getCurrentSession()
      if (!session) throw new Error('No active session')

      const { data: workspaces, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          panels (
            position,
            document_id,
            document_name,
            document_type,
            zoom,
            mode
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching workspaces:', error)
        throw error
      }

      console.log('Workspaces fetched:', workspaces)
      return workspaces
    } catch (error) {
      console.error('Error in getUserWorkspaces:', error)
      throw error
    }
  },

  async updateWorkspace(workspaceId, updates) {
    console.log('Updating workspace:', { workspaceId, updates })
    try {
      const session = await authService.getCurrentSession()
      if (!session) throw new Error('No active session')

      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', workspaceId)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) throw error

      console.log('Workspace updated:', data)
      return data
    } catch (error) {
      console.error('Error updating workspace:', error)
      throw error
    }
  },

  async deleteWorkspace(workspaceId) {
    console.log('Deleting workspace:', workspaceId)
    try {
      const session = await authService.getCurrentSession()
      if (!session) throw new Error('No active session')

      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)
        .eq('user_id', session.user.id)

      if (error) throw error

      console.log('Workspace deleted successfully')
    } catch (error) {
      console.error('Error deleting workspace:', error)
      throw error
    }
  }
} 