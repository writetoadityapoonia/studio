
'use client';

import { useDraggable } from '@dnd-kit/core';
import { Type, RectangleHorizontal, Table } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

// --- Component Types ---
export type ComponentType = 'Text' | 'Button' | 'Table';

export interface BaseComponent {
  id: string;
  type: ComponentType;
}

export type TextSize = 'sm' | 'md' | 'lg' | 'xl';

export interface TextComponent extends BaseComponent {
  type: 'Text';
  text: string;
  size: TextSize;
}

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  text: string;
}

export interface TableComponent extends BaseComponent {
  type: 'Table';
  headers: string[];
  rows: string[][];
}

export type BuilderComponent = TextComponent | ButtonComponent | TableComponent;


// --- Helper Functions ---
// A simple parser to regenerate builder components from a JSON string
export const parseDescription = (description: string): BuilderComponent[] => {
    try {
        const components = JSON.parse(description);
        if (Array.isArray(components)) {
            // Basic validation, could be improved with Zod
            return components.filter(c => c.id && c.type);
        }
    } catch (e) {
        // Fallback for malformed JSON or old HTML content
        return generateInitialComponentsFromHtml(description);
    }

    return [
        { id: uuidv4(), type: 'Text', text: 'Start building your description here.', size: 'md' },
    ];
};

// Fallback to generate components from saved HTML for backward compatibility
// This is basic and would need to be more robust for a real application
export const generateInitialComponentsFromHtml = (html: string): BuilderComponent[] => {
    if (!html || typeof document === 'undefined') {
        return [
            { id: uuidv4(), type: 'Text', text: 'Welcome to your new property! Edit this description.', size: 'md' },
            { id: uuidv4(), type: 'Button', text: 'Contact Us' },
        ];
    }
    const components: BuilderComponent[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.body.childNodes.forEach(node => {
        if (node.nodeName === 'P') {
            const p = node as HTMLParagraphElement;
            const size = p.style.fontSize;
            let textSize: TextSize = 'md';
            if (size === '0.875rem') textSize = 'sm';
            if (size === '1.25rem') textSize = 'lg';
            if (size === '1.5rem') textSize = 'xl';
            components.push({ id: uuidv4(), type: 'Text', text: p.innerText, size: textSize });
        } else if (node.nodeName === 'BUTTON') {
             components.push({ id: uuidv4(), type: 'Button', text: (node as HTMLButtonElement).innerText });
        } else if (node.nodeName === 'TABLE') {
            const table = node as HTMLTableElement;
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText);
            const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
                return Array.from(tr.querySelectorAll('td')).map(td => td.innerText);
            });
            components.push({ id: uuidv4(), type: 'Table', headers, rows });
        }
    });
    return components.length > 0 ? components : [
        { id: uuidv4(), type: 'Text', text: 'Start building your description here.', size: 'md' },
    ];
};



// --- Toolbox Components ---
const ToolboxItem = ({ type }: { type: ComponentType }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `toolbox-${type}`,
    data: { type },
  });

  let Icon;
  switch (type) {
    case 'Text': Icon = Type; break;
    case 'Button': Icon = RectangleHorizontal; break;
    case 'Table': Icon = Table; break;
    default: Icon = Type;
  }
  

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
        <ToolboxItem type="Table" />
      </CardContent>
    </Card>
  );
};
