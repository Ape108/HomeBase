import React from 'react';
import { ExternalLink, Linkedin, Info, FileText, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Start with a very simple version to test
export function InfoLinks({ onClose }) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg text-white">
      <h2>Information</h2>
      <p>This is a test</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
} 