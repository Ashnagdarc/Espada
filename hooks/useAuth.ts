import { useContext } from 'react'
import { SupabaseAuthContext } from '@/contexts/SupabaseAuthContext'

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  
  return context
}

export default useAuth