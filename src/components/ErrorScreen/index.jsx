import React from 'react'

export function ErrorScreen({ error, state }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">
        <p>Error: {error}</p>
        <p className="text-sm mt-2">State: {state}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    </div>
  )
} 