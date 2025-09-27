import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, Sparkles } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-2">
      <Link to="/">
        <Button 
          variant={location.pathname === '/' ? 'canvas' : 'ghost'} 
          size="sm"
          className="flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          Brochure Designer
        </Button>
      </Link>
      <Link to="/image-generation">
        <Button 
          variant={location.pathname === '/image-generation' ? 'canvas' : 'ghost'} 
          size="sm"
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI Image Generation
        </Button>
      </Link>
    </nav>
  );
};