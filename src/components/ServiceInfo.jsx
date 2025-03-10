import React from 'react';
import { ExternalLink, Linkedin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ServiceInfo() {
  return (
    <div className="service-info-container p-4 bg-slate-900 backdrop-blur-sm rounded-lg shadow-lg w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 flex items-center text-white">
          <Info className="mr-2 h-5 w-5" />
          About This Tool
        </h2>
        <p className="text-sm text-gray-300">
          WorkflowTool helps you organize your writing and research. Drag and drop panels to customize your workspace.
        </p>
      </div>
      
      <div className="mb-4 text-white">
        <h3 className="text-lg font-medium mb-2">Premium Services</h3>
        <ul className="text-sm space-y-2">
          <li>✓ Custom workflow templates</li>
          <li>✓ Advanced AI integration</li>
          <li>✓ Team collaboration features</li>
          <li>✓ Priority support</li>
        </ul>
      </div>
      
      <div className="flex flex-col space-y-2">
        {/* GitHub link */}
        <Button 
          variant="outline" 
          className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white"
          onClick={() => window.open('https://github.com/Ape108', '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit My GitHub
        </Button>
        
        {/* LinkedIn link */}
        <Button 
          variant="outline" 
          className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white"
          onClick={() => window.open('https://www.linkedin.com/in/cameron-akhtar-8b1226281/', '_blank')}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          Connect on LinkedIn
        </Button>
      </div>
      
      <div className="mt-4 pt-2 border-t border-slate-700">
        <p className="text-xs text-gray-400">
          By using this application, you agree to our <button className="text-blue-500 hover:underline" onClick={() => alert('Terms of Service content goes here')}>Terms of Service</button>.
        </p>
      </div>
    </div>
  );
} 