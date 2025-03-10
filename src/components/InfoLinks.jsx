import React from 'react';
import { ExternalLink, Linkedin, Info, FileText, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InfoLinks({ onClose }) {
  return (
    <div className="info-links-container p-4 bg-slate-900 text-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3">About</h2>
        
        {/* Existing links with improved styling */}
        <div className="flex flex-col space-y-3">
          <a href="/privacy" className="flex items-center hover:text-blue-400 transition-colors">
            <ExternalLink className="mr-2 h-4 w-4" />
            Privacy Policy
          </a>
          
          <a href="/terms" className="flex items-center hover:text-blue-400 transition-colors">
            <ExternalLink className="mr-2 h-4 w-4" />
            Terms of Service
          </a>
          
          <a href="/readme" className="flex items-center hover:text-blue-400 transition-colors">
            <ExternalLink className="mr-2 h-4 w-4" />
            README
          </a>
        </div>
      </div>
      
      {/* New section for services */}
      <div className="my-4 pt-3 border-t border-slate-700">
        <h2 className="text-xl font-semibold mb-3">My Services</h2>
        <div className="mb-3 text-sm">
          <p>I offer premium workflow solutions for teams and individuals:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Custom workflow templates</li>
            <li>Integration consulting</li>
            <li>Training & onboarding</li>
          </ul>
        </div>
      </div>
      
      {/* Links section with LinkedIn and Portfolio */}
      <div className="pt-3 border-t border-slate-700">
        <h2 className="text-xl font-semibold mb-3">Connect</h2>
        <div className="flex flex-col space-y-2">
          {/* LinkedIn button */}
          <Button 
            variant="outline" 
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border-slate-600"
            onClick={() => window.open('www.linkedin.com/in/cameron-akhtar', '_blank')}
          >
            <Linkedin className="mr-2 h-4 w-4" />
            Connect on LinkedIn
          </Button>
          
          {/* Portfolio button */}
          <Button 
            variant="outline" 
            className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border-slate-600"
            onClick={() => window.open('https://github.com/Ape108', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit My Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
} 