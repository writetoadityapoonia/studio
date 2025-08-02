
'use client';

import { useDraggable } from '@dnd-kit/core';
import { Type, RectangleHorizontal, Table, Image, Minus, Divide } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

// --- Helper Functions ---
export const parseDescription = (description) => {
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
export const generateInitialComponentsFromHtml = (html) => {
    if (!html) {
       return [{ id: uuidv4(), type: 'Text', text: 'Start building your description here.', size: 'md', align: 'left', color: 'default', style: [] }];
    }
    // This function can be kept for backward compatibility if needed,
    // but new content should be created as JSON.
    // For now, we just return a default text component.
    return [{ id: uuidv4(), type: 'Text', text: html, size: 'md', align: 'left', color: 'default', style: [] }];
};



// --- Toolbox Components ---
const ToolboxItem = ({ type, icon: Icon }) => {
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
