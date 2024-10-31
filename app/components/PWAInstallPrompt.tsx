"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      const { outcome } = await deferredPrompt.prompt();
      if (outcome === 'accepted') {
        toast.success('App installed successfully!');
        setIsInstallable(false);
      }
    } catch (error) {
      toast.error('Failed to install app');
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4">
      <Button 
        onClick={handleInstall}
        className="w-full md:w-auto shadow-lg"
        size="lg"
      >
        <Download className="mr-2 h-4 w-4" />
        Install WHATEVER™
      </Button>
    </div>
  );
} 