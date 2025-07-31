'use client';

import { useDraggable } from '@dnd-kit/core';
import { Type, RectangleHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

// --- Component Types ---
export type ComponentType = 'Text' | 'Button';

export interface BaseComponent {
  id: string;
  type: ComponentType;
}

export interface TextComponent extends BaseComponent {
  type: 'Text';
  text: string;
}

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  text: string;
}

export type BuilderComponent = TextComponent | ButtonComponent;


// --- Helper Functions ---
export const componentToHtml = (components: BuilderComponent[]): string => {
    const bodyContent = components.map(component => {
        switch (component.type) {
            case 'Text':
                return `<p style="font-size: 1rem; margin: 0.5rem 0;">${component.text}</p>`;
            case 'Button':
                return `<button style="background-color: #6d28d9; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">${component.text}</button>`;
            default:
                return '';
        }
    }).join('\n');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Description</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.5;
            padding: 1rem;
            background-color: transparent;
            color: hsl(var(--foreground));
        }
        p { margin: 1rem 0; }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>
    `;
};


// A simple parser to regenerate builder components from saved HTML
// This is basic and would need to be more robust for a real application
export const generateInitialComponents = (html: string): BuilderComponent[] => {
    if (!html || typeof document === 'undefined') {
        return [
            { id: uuidv4(), type: 'Text', text: 'Welcome to your new property! Edit this description.' },
            { id: uuidv4(), type: 'Button', text: 'Contact Us' },
        ];
    }
    const components: BuilderComponent[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.body.childNodes.forEach(node => {
        if (node.nodeName === 'P') {
            components.push({ id: uuidv4(), type: 'Text', text: (node as HTMLParagraphElement).innerText });
        } else if (node.nodeName === 'BUTTON') {
             components.push({ id: uuidv4(), type: 'Button', text: (node as HTMLButtonElement).innerText });
        }
    });
    return components.length > 0 ? components : [
        { id: uuidv4(), type: 'Text', text: 'Start building your description here.' },
    ];
};



// --- Toolbox Components ---
const ToolboxItem = ({ type }: { type: ComponentType }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbox-${type}`,
    data: { type },
  });

  const Icon = type === 'Text' ? Type : RectangleHorizontal;

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
        <ToolboxItem type="Text" />
        <ToolboxItem type="Button" />
      </CardContent>
    </Card>
  );
};
