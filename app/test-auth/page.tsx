import { createClient } from '@/lib/supabase-server'

export default async function TestAuth() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      <div className="space-y-2">
        <p><strong>Session exists:</strong> {session ? 'Yes' : 'No'}</p>
        {session && (
          <>
            <p><strong>User email:</strong> {session.user.email}</p>
            <p><strong>Session ID:</strong> {session.access_token.substring(0, 20)}...</p>
          </>
        )}
      </div>
    </div>
  )
}