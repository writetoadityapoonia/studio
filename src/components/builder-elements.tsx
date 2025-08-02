
'use client';

import { useDraggable } from '@dnd-kit/core';
import { Type, RectangleHorizontal, Table, Image, Minus, Divide } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

// --- Component Types ---
export type ComponentType = 'Text' | 'Button' | 'Table' | 'Image' | 'Spacer' | 'Divider';

export interface BaseComponent {
  id: string;
  type: ComponentType;
}

export type TextSize = 'sm' | 'md' | 'lg' | 'xl';
export type TextColor = 'default' | 'primary' | 'muted';
export type TextStyle = 'bold' | 'italic';

export interface TextComponent extends BaseComponent {
  type: 'Text';
  text: string;
  size: TextSize;
  align: 'left' | 'center' | 'right';
  color: TextColor;
  style: TextStyle[];
}

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  text: string;
  href: string;
  variant: ButtonVariant;
  size: ButtonSize;
}

export interface TableComponent extends BaseComponent {
  type: 'Table';
  headers: string[];
  rows: string[][];
}

export interface ImageComponent extends BaseComponent {
    type: 'Image';
    src: string;
    alt: string;
}

export type SpacerSize = 'sm' | 'md' | 'lg';

export interface SpacerComponent extends BaseComponent {
    type: 'Spacer';
    size: SpacerSize;
}

export interface DividerComponent extends BaseComponent {
    type: 'Divider';
}


export type BuilderComponent = TextComponent | ButtonComponent | TableComponent | ImageComponent | SpacerComponent | DividerComponent;


// --- Helper Functions ---
export const parseDescription = (description: string): BuilderComponent[] => {
    try {
        if (!description) return [];
        const components = JSON.parse(description);
        if (Array.isArray(components)) {
            // Basic validation and providing default values for new properties
            return components.map(c => {
                if (c.type === 'Text') {
                    return {
                        align: 'left',
                        color: 'default',
                        style: [],
                        ...c
                    };
                }
                 if (c.type === 'Button') {
                    return {
                        href: '',
                        variant: 'default',
                        size: 'default',
                        ...c
                    };
                }
                return c;
            }).filter(c => c.id && c.type);
        }
    } catch (e) {
         console.error("Failed to parse description JSON:", e);
         return [];
    }
    return [];
};


// Fallback for old content, no longer primary method
export const generateInitialComponentsFromHtml = (html: string): BuilderComponent[] => {
    if (!html) {
       return [{ id: uuidv4(), type: 'Text', text: 'Start building your description here.', size: 'md', align: 'left', color: 'default', style: [] }];
    }
    // This function can be kept for backward compatibility if needed,
    // but new content should be created as JSON.
    // For now, we just return a default text component.
    return [{ id: uuidv4(), type: 'Text', text: html, size: 'md', align: 'left', color: 'default', style: [] }];
};



// --- Toolbox Components ---
const ToolboxItem = ({ type, icon: Icon }: { type: ComponentType, icon: React.ElementType }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbox-${type}`,
    data: { type },
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="flex items-center gap-4 p-2 bg-card rounded-lg border cursor-grab">
      <Icon className="w-6 h-6 text-primary" />
      <span className="font-medium">{type}</span>
    </div>
  );
};

export const Toolbox = () => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Toolbox</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToolboxItem type="Text" icon={Type} />
        <ToolboxItem type="Button" icon={RectangleHorizontal} />
        <ToolboxItem type="Table" icon={Table} />
        <ToolboxItem type="Image" icon={Image} />
        <ToolboxItem type="Spacer" icon={Minus} />
        <ToolboxItem type="Divider" icon={Divide} />
      </CardContent>
    </Card>
  );
};
