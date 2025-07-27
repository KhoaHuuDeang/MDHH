import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
  export const getIcon = (iconName: string, size = 22, className?: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon
    return IconComponent ? <IconComponent size={size} className={className} /> : null
  }
