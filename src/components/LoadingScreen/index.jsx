import React from 'react'

export function LoadingScreen({ state }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-foreground">
        <p>Initializing Google API...</p>
        <p className="text-sm mt-2">State: {state}</p>
      </div>
    </div>
  )
} 