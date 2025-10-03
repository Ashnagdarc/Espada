'use client';

import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export default function AuthTestPage() {
  const { user, profile, isLoading, handleRoleBasedRedirect } = useCustomerAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Loading State:</h2>
            <p>{isLoading ? 'Loading...' : 'Loaded'}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">User State:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({
                id: user?.id,
                email: user?.primaryEmail,
                displayName: user?.displayName
              }, null, 2)}
            </pre>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Profile State:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Actions:</h2>
            <button 
              onClick={() => handleRoleBasedRedirect()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Role-Based Redirect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}