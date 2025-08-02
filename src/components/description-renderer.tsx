
'use client';

import { BuilderComponent, parseDescription } from '@/components/builder-elements';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';


export function DescriptionRenderer({ description }: { description: string }) {
    const components = parseDescription(description);
    return (
        <div className="space-y-4">
        {components.map((component: BuilderComponent) => {
            switch (component.type) {
            case 'Text': {
                const fontSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
                const fontColorMap = { default: 'text-foreground', primary: 'text-primary', muted: 'text-muted-foreground' };
                const textAlignMap = { left: 'text-left', center: 'text-center', right: 'text-right' };
                return <p key={component.id} className={cn(
                    "w-full whitespace-pre-wrap",
                    fontSizeMap[component.size],
                    fontColorMap[component.color],
                    textAlignMap[component.align],
                    { 'font-bold': component.style.includes('bold') },
                    { 'italic': component.style.includes('italic') },
                )}>{component.text}</p>;
            }
            case 'Button': {
                const button = <Button key={component.id} variant={component.variant} size={component.size}>{component.text}</Button>;
                if (component.href) {
                    return <a href={component.href} target="_blank" rel="noopener noreferrer" className="inline-block">{button}</a>
                }
                return button;
            }
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
            case 'Image':
                 return (
                    <div key={component.id} className="flex justify-center my-4">
                        <Image src={component.src} alt={component.alt} width={800} height={600} className="rounded-md object-cover max-w-full h-auto" data-ai-hint="property element" />
                    </div>
                );
            case 'Spacer': {
                const sizeMap = { sm: 'h-4', md: 'h-8', lg: 'h-16' };
                return <div key={component.id} className={cn("w-full", sizeMap[component.size])}></div>;
            }
            case 'Divider':
                return <Separator key={component.id} className="my-4" />;
            default:
                return null;
            }
        })}
        </div>
    );
}
