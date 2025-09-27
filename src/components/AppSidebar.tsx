import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings2, FileImage, Grid3X3, Download, RefreshCw, Image, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { BrochureConfig, BrochureData } from '@/types/api';

interface AppSidebarProps {
  configurations: BrochureConfig[];
  selectedConfig: string;
  setSelectedConfig: (id: string) => void;
  productData: BrochureData[];
  selectedSku: string;
  setSelectedSku: (sku: string) => void;
  combinedSettings: { rows: number; cols: number; width: number; height: number; spacing: number; };
  setCombinedSettings: (settings: any) => void;
  loading: boolean;
  generating: boolean;
  onLoadConfigurations: () => void;
  onLoadProductData: () => void;
  onLoadComponents: () => void;
  onGenerateSingle: () => void;
  onGenerateCombined: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    config: true,
    product: true,
    combined: false,
    generate: true,
  });

  const toggleGroup = (group: keyof typeof expandedGroups) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} border-r border-sidebar-border bg-sidebar transition-all duration-300`}>
      <div className="p-3 border-b border-sidebar-border">
        <Button variant="ghost" size="tool" onClick={() => setCollapsed(!collapsed)} className="mb-2">
          <Settings2 className="h-4 w-4" />
        </Button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-sm font-semibold text-sidebar-foreground">Design Tools</div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Configuration */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('config')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Configuration</span>}
            </div>
            {!collapsed && (expandedGroups.config ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.config && (
            <div className="pl-2 space-y-3">
              <Select value={props.selectedConfig} onValueChange={props.setSelectedConfig}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {props.configurations.map(config => (
                    <SelectItem key={config.id} value={config.id}>{config.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-1">
                <Button variant="tool" size="sm" onClick={props.onLoadConfigurations}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button variant="primary" size="sm">New</Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Product Data */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('product')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Product Data</span>}
            </div>
            {!collapsed && (expandedGroups.product ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.product && (
            <div className="pl-2 space-y-3">
              <Select value={props.selectedSku} onValueChange={props.setSelectedSku}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose SKU..." />
                </SelectTrigger>
                <SelectContent>
                  {props.productData.map(product => (
                    <SelectItem key={product.sku} value={product.sku}>{product.sku}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Button variant="tool" size="sm" onClick={props.onLoadProductData} className="w-full">
                  <RefreshCw className="h-3 w-3" /> Load Data
                </Button>
                <Button variant="primary" size="sm" onClick={props.onLoadComponents} disabled={props.loading} className="w-full">
                  {props.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Image className="h-3 w-3" />}
                  Load Components
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Generation */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('generate')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Generate</span>}
            </div>
            {!collapsed && (expandedGroups.generate ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.generate && (
            <div className="pl-2 space-y-2">
              <Button variant="primary" size="sm" onClick={props.onGenerateSingle} disabled={props.generating} className="w-full">
                {props.generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                Single
              </Button>
              <Button variant="accent" size="sm" onClick={props.onGenerateCombined} disabled={props.generating} className="w-full">
                {props.generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Grid3X3 className="h-3 w-3" />}
                Combined
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};