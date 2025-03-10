import { supabase } from '@/lib/supabase'
import { handleAuth as handleGoogleAuth } from './googleApi'

export const authService = {
  async signInWithGoogle() {
    try {
      // First get Google user info
      const googleUser = await handleGoogleAuth()
      
      if (!googleUser) {
        throw new Error('Google authentication failed')
      }

      // Sign in with Supabase using Google OAuth
      const { data: { session }, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error
      
      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: googleUser.email,
          full_name: googleUser.name,
          avatar_url: googleUser.picture,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError

      return session.user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 