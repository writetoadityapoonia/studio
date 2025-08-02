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
export const componentToHtml = (components: BuilderComponent[]): string => {
    const bodyContent = components.map(component => {
        switch (component.type) {
            case 'Text':
                const fontSizeMap = { sm: '0.875rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' };
                return `<p style="font-size: ${fontSizeMap[component.size]}; margin: 0.5rem 0;">${component.text}</p>`;
            case 'Button':
                return `<button style="background-color: #6d28d9; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">${component.text}</button>`;
            case 'Table':
                 try {
                    if (!Array.isArray(component.headers) || !Array.isArray(component.rows)) return '<div>Invalid table data</div>';
                    const headerHtml = `<thead><tr>${component.headers.map(h => `<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${h}</th>`).join('')}</tr></thead>`;
                    const bodyHtml = `<tbody>${component.rows.map(row => `<tr>${row.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${cell || ''}</td>`).join('')}</tr>`).join('')}</tbody>`;
                    return `<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">${headerHtml}${bodyHtml}</table>`;
                } catch (e) {
                    return '<div>Invalid table data</div>';
                }
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
            line-height: 1.6;
            background-color: transparent;
            color: hsl(var(--foreground));
            margin: 0;
            padding: 0.1rem; /* Add tiny padding to help with height calculation */
        }
        p, div, table { margin: 1rem 0; }
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
