'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Type, RectangleHorizontal, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { savePageContent } from '@/lib/actions';


// --- Component Types ---
type ComponentType = 'Text' | 'Button';

interface BaseComponent {
  id: string;
  type: ComponentType;
}

interface TextComponent extends BaseComponent {
  type: 'Text';
  text: string;
}

interface ButtonComponent extends BaseComponent {
  type: 'Button';
  text: string;
}

type BuilderComponent = TextComponent | ButtonComponent;

const initialComponents: BuilderComponent[] = [
  { id: uuidv4(), type: 'Text', text: 'Welcome to your page!' },
  { id: uuidv4(), type: 'Button', text: 'Click Me' },
];


// --- Helper Functions ---
const componentToHtml = (component: BuilderComponent): string => {
    switch (component.type) {
        case 'Text':
            return `<p style="font-size: 1rem; margin: 0.5rem 0;">${component.text}</p>`;
        case 'Button':
            return `<button style="background-color: #6d28d9; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">${component.text}</button>`;
        default:
            return '';
    }
}

const generateHtmlPage = (components: BuilderComponent[]): string => {
    const bodyContent = components.map(componentToHtml).join('\n');
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Preview</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.5;
            padding: 1rem;
            background-color: #f3f4f6;
        }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>
    `;
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

const Toolbox = () => {
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


// --- Canvas Components ---

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      {children}
    </div>
  );
}

const CanvasComponent = ({ component, selected, onSelect, onDelete }: { component: BuilderComponent; selected: boolean; onSelect: () => void; onDelete: () => void; }) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'Text':
        return <p className="text-lg">{component.text}</p>;
      case 'Button':
        return <Button>{component.text}</Button>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 my-2 border-2 border-dashed border-transparent transition-all rounded-lg cursor-pointer bg-background',
        { 'border-primary bg-primary/10': selected }
      )}
    >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
        </div>
      {renderComponent()}
    </div>
  );
};


const Canvas = ({ components, setComponents, selectedComponentId, setSelectedComponentId }: 
  { components: BuilderComponent[], setComponents: React.Dispatch<React.SetStateAction<BuilderComponent[]>>, selectedComponentId: string | null, setSelectedComponentId: (id: string | null) => void }
) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  const componentIds = components.map(c => c.id);

  const handleDrop = (event: DragEndEvent) => {
     const { active, over } = event;
     if (!over || !active.id.toString().startsWith('toolbox-')) return;
     
     const type = active.data.current?.type as ComponentType;
     let newComponent: BuilderComponent;

     switch (type) {
         case 'Text':
             newComponent = { id: uuidv4(), type: 'Text', text: 'New Text Block' };
             break;
         case 'Button':
             newComponent = { id: uuidv4(), type: 'Button', text: 'New Button' };
             break;
         default:
             return;
     }

    const overIndex = components.findIndex(c => c.id === over.id);
    const newIndex = overIndex !== -1 ? overIndex : components.length;

     setComponents(prev => {
        const newItems = [...prev];
        newItems.splice(newIndex, 0, newComponent);
        return newItems;
     });
     setSelectedComponentId(newComponent.id);
  };


  return (
    <SortableContext items={componentIds}>
      <div ref={setNodeRef} className="w-full h-full bg-muted/30 rounded-lg p-4 space-y-2 overflow-y-auto">
        {components.length > 0 ? (
          components.map(component => (
            <SortableItem key={component.id} id={component.id}>
              <CanvasComponent
                component={component}
                selected={selectedComponentId === component.id}
                onSelect={() => setSelectedComponentId(component.id)}
                onDelete={() => {
                  setComponents(prev => prev.filter(c => c.id !== component.id));
                  if (selectedComponentId === component.id) {
                    setSelectedComponentId(null);
                  }
                }}
              />
            </SortableItem>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Plus className="w-12 h-12 mb-4" />
            <p>Drag elements from the toolbox here to start building your page.</p>
          </div>
        )}
      </div>
    </SortableContext>
  );
};


// --- Properties Panel ---
const PropertiesPanel = ({ selectedComponent, onUpdate }: { selectedComponent: BuilderComponent | null; onUpdate: (id: string, newProps: Partial<BuilderComponent>) => void }) => {
  if (!selectedComponent) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a component to see its properties.</p>
        </CardContent>
      </Card>
    );
  }

  const renderProperties = () => {
    switch (selectedComponent.type) {
      case 'Text':
      case 'Button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text Content</Label>
              <Input
                id="text"
                value={selectedComponent.text}
                onChange={(e) => onUpdate(selectedComponent.id, { text: e.target.value })}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{selectedComponent.type} Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderProperties()}
      </CardContent>
    </Card>
  );
};


// --- Page Builder ---
export default function BuilderPage() {
  const [components, setComponents] = useState<BuilderComponent[]>(initialComponents);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  const handleUpdate = (id: string, newProps: Partial<BuilderComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...newProps } : c));
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    
    // Dropping from Toolbox
    if (active.id.toString().startsWith('toolbox-')) {
        const type = active.data.current?.type as ComponentType;
        let newComponent: BuilderComponent;

        switch (type) {
            case 'Text':
                newComponent = { id: uuidv4(), type: 'Text', text: 'New Text Block' };
                break;
            case 'Button':
                newComponent = { id: uuidv4(), type: 'Button', text: 'New Button' };
                break;
            default:
                return;
        }

        const overIndex = over.id === 'canvas' ? components.length : components.findIndex(c => c.id === over.id);
        
        setComponents(prev => {
            const newItems = [...prev];
            newItems.splice(overIndex, 0, newComponent);
            return newItems;
        });
        setSelectedComponentId(newComponent.id);
        return;
    }
    
    // Reordering in Canvas
    const activeIdStr = active.id.toString();
    const overId = over.id.toString();
    if (activeIdStr !== overId) {
        setComponents(items => {
            const oldIndex = items.findIndex(item => item.id === activeIdStr);
            const newIndex = items.findIndex(item => item.id === overId);
            if (oldIndex === -1 || newIndex === -1) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  };
  
  const handleSave = async () => {
    const htmlContent = generateHtmlPage(components);
    try {
        await savePageContent(htmlContent);
        toast({
            title: "Page Content Saved!",
            description: "The HTML content has been logged to the server console.",
        });
    } catch (error) {
        toast({
            title: "Error Saving Content",
            description: "There was an error saving the page content.",
            variant: "destructive",
        });
    }
  };

  const activeComponentType = activeId && activeId.startsWith('toolbox-') ? activeId.split('-')[1] as ComponentType : null;


  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={e => setActiveId(e.active.id.toString())}>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Page Builder</h1>
            <Button onClick={handleSave}>
                <Save className="mr-2" />
                Save Page
            </Button>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_350px] flex-grow overflow-hidden">
            {/* Toolbox */}
            <div className="p-4 border-r h-full overflow-y-auto">
            <Toolbox />
            </div>

            {/* Canvas */}
            <main className="p-4 h-full overflow-y-auto">
            <Canvas components={components} setComponents={setComponents} selectedComponentId={selectedComponentId} setSelectedComponentId={setSelectedComponentId} />
            </main>

            {/* Properties Panel */}
            <div className="p-4 border-l h-full overflow-y-auto">
            <PropertiesPanel selectedComponent={selectedComponent} onUpdate={handleUpdate} />
            </div>
        </div>
      </div>
      <DragOverlay>
        {activeComponentType ? (
          <div className="flex items-center gap-4 p-2 bg-primary text-primary-foreground rounded-lg border cursor-grabbing shadow-lg">
             {activeComponentType === 'Text' ? <Type className="w-6 h-6" /> : <RectangleHorizontal className="w-6 h-6" />}
             <span className="font-medium">{activeComponentType}</span>
           </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
