import React from 'react';
import { ExternalLink, Linkedin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ServiceInfo() {
  return (
    <div className="service-info-container p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Info className="mr-2 h-5 w-5" />
          About This Tool
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          WorkflowTool helps you organize your writing and research. Drag and drop panels to customize your workspace.
        </p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Premium Services</h3>
        <ul className="text-sm space-y-2">
          <li>✓ Custom workflow templates</li>
          <li>✓ Advanced AI integration</li>
          <li>✓ Team collaboration features</li>
          <li>✓ Priority support</li>
        </ul>
      </div>
      
      <div className="flex flex-col space-y-2">
        {/* Portfolio link - you'll add your URL here */}
        <Button 
          variant="outline" 
          className="flex items-center justify-center"
          onClick={() => window.open('YOUR_PORTFOLIO_URL', '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit My Portfolio
        </Button>
        
        {/* LinkedIn link - you'll add your URL here */}
        <Button 
          variant="outline" 
          className="flex items-center justify-center"
          onClick={() => window.open('YOUR_LINKEDIN_URL', '_blank')}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          Connect on LinkedIn
        </Button>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By using this application, you agree to our <button className="text-blue-500 hover:underline" onClick={() => alert('Terms of Service content goes here')}>Terms of Service</button>.
        </p>
      </div>
    </div>
  );
} 