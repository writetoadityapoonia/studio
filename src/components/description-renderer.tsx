
'use client';

import { BuilderComponent, parseDescription } from '@/components/builder-elements';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


export function DescriptionRenderer({ description }: { description: string }) {
    const components = parseDescription(description);
    return (
        <div className="space-y-4">
        {components.map((component: BuilderComponent) => {
            switch (component.type) {
            case 'Text':
                const fontSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
                return <p key={component.id} className={cn(fontSizeMap[component.size])}>{component.text}</p>;
            case 'Button':
                return <Button key={component.id}>{component.text}</Button>;
            case 'Table':
                if (!Array.isArray(component.headers) || !Array.isArray(component.rows)) {
                return <div key={component.id} className="text-destructive">Invalid table data.</div>;
                }
                if (component.headers.length === 0 || component.rows.length === 0) {
                return <div key={component.id} className="text-muted-foreground">Empty table.</div>
                }
                return (
                <div key={component.id} className="overflow-x-auto my-4">
                    <table className="w-full text-sm text-left border-collapse border border-border">
                    <thead className="bg-muted/50">
                        <tr>
                        {component.headers.map((h, i) => <th key={i} className="p-2 font-medium border border-border">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {component.rows.map((row, i) => (
                        <tr key={i} className="border-b border-border">
                            {row.map((cell, j) => <td key={j} className="p-2 border border-border">{cell}</td>)}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                );
            default:
                return null;
            }
        })}
        </div>
    );
}
