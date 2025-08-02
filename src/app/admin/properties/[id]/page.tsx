
'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Type, RectangleHorizontal, Save, GripVertical, TableIcon, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createProperty, updateProperty } from '@/lib/actions';
import { getPropertyById } from '@/lib/data';
import type { Property } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import { Toolbox, BuilderComponent, componentToHtml, generateInitialComponents, TextSize, TableComponent } from '@/components/builder-elements';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientOnly } from '@/components/client-only';
import { Switch } from '@/components/ui/switch';


function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
       <div {...listeners} className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 cursor-grab opacity-30 hover:opacity-100">
           <GripVertical className="w-5 h-5" />
       </div>
      {children}
    </div>
  );
}

const CanvasComponent = ({ component, selected, onSelect, onDelete }: { component: BuilderComponent; selected: boolean; onSelect: () => void; onDelete: () => void; }) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'Text':
        const fontSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
        return <p className={cn("py-2", fontSizeMap[component.size])}>{component.text}</p>;
      case 'Button':
        return <Button>{component.text}</Button>;
       case 'Table':
            if (!Array.isArray(component.headers) || !Array.isArray(component.rows)) {
                return <p className="text-destructive">Invalid table data.</p>;
            }
            if (component.headers.length === 0 || component.rows.length === 0) {
                 return <p className="text-muted-foreground">Table is empty. Add headers and rows in the properties panel.</p>
            }

            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50">
                            <tr>{component.headers.map((h, i) => <th key={i} className="p-2 font-medium">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {component.rows.map((row, i) => (
                                <tr key={i} className="border-b">
                                    {row.map((cell, j) => <td key={j} className="p-2">{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 my-2 border-2 border-dashed border-transparent transition-all rounded-lg cursor-pointer bg-background relative group',
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
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <SortableContext items={components.map(c => c.id)}>
      <div ref={setNodeRef} id="canvas" className={cn("w-full h-full bg-muted/30 rounded-lg p-8 space-y-2 overflow-y-auto", {"bg-primary/10": isOver})}>
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
            <p>Drag elements from the toolbox here.</p>
          </div>
        )}
      </div>
    </SortableContext>
  );
};

const PropertiesPanel = ({ selectedComponent, onUpdate }: { selectedComponent: BuilderComponent | null; onUpdate: (id: string, newProps: Partial<BuilderComponent>) => void }) => {
  const [tableJsonMode, setTableJsonMode] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedComponent?.type === 'Table') {
      setJsonString(JSON.stringify({ headers: selectedComponent.headers, rows: selectedComponent.rows }, null, 2));
      setJsonError(null);
    }
  }, [selectedComponent]);


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

  const handleJsonChange = (value: string) => {
    setJsonString(value);
    try {
        const parsed = JSON.parse(value);
        if (
            !parsed ||
            !Array.isArray(parsed.headers) ||
            !Array.isArray(parsed.rows) ||
            parsed.rows.some((r: any) => !Array.isArray(r))
        ) {
            throw new Error('Invalid JSON structure. Must have "headers" and "rows" arrays.');
        }
        onUpdate(selectedComponent.id, { headers: parsed.headers, rows: parsed.rows });
        setJsonError(null);
    } catch (error: any) {
        setJsonError(error.message);
    }
  };


    const handleTableChange = (rowIndex: number, colIndex: number, value: string) => {
        if (selectedComponent.type !== 'Table') return;
        const newRows = [...selectedComponent.rows];
        newRows[rowIndex][colIndex] = value;
        onUpdate(selectedComponent.id, { rows: newRows });
    };

    const handleHeaderChange = (colIndex: number, value: string) => {
        if (selectedComponent.type !== 'Table') return;
        const newHeaders = [...selectedComponent.headers];
        newHeaders[colIndex] = value;
        onUpdate(selectedComponent.id, { headers: newHeaders });
    };

    const addRow = () => {
        if (selectedComponent.type !== 'Table') return;
        const newRows = [...selectedComponent.rows, Array(selectedComponent.headers.length).fill('')];
        onUpdate(selectedComponent.id, { rows: newRows });
    };
    
    const addColumn = () => {
        if (selectedComponent.type !== 'Table') return;
        const newHeaders = [...selectedComponent.headers, 'New Header'];
        const newRows = selectedComponent.rows.map(row => [...row, '']);
        onUpdate(selectedComponent.id, { headers: newHeaders, rows: newRows });
    };

    const removeRow = (index: number) => {
        if (selectedComponent.type !== 'Table') return;
        const newRows = selectedComponent.rows.filter((_, i) => i !== index);
        onUpdate(selectedComponent.id, { rows: newRows });
    }
    
    const removeColumn = (index: number) => {
        if (selectedComponent.type !== 'Table') return;
        if (selectedComponent.headers.length <= 1) return;
        const newHeaders = selectedComponent.headers.filter((_, i) => i !== index);
        const newRows = selectedComponent.rows.map(row => row.filter((_, i) => i !== index));
        onUpdate(selectedComponent.id, { headers: newHeaders, rows: newRows });
    }


  const renderProperties = () => {
    switch (selectedComponent.type) {
      case 'Text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text Content</Label>
              <Textarea
                id="text"
                value={selectedComponent.text}
                onChange={(e) => onUpdate(selectedComponent.id, { text: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
             <div>
                <Label htmlFor="size">Font Size</Label>
                <Select value={selectedComponent.size} onValueChange={(value: TextSize) => onUpdate(selectedComponent.id, { size: value })}>
                    <SelectTrigger id="size">
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        );
      case 'Button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text Content</Label>
              <Textarea
                id="text"
                value={selectedComponent.text}
                onChange={(e) => onUpdate(selectedComponent.id, { text: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        );
       case 'Table':
        return (
            <div className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Switch id="json-mode" checked={tableJsonMode} onCheckedChange={setTableJsonMode} />
                    <Label htmlFor="json-mode" className="flex items-center gap-2"><Code className="w-4 h-4"/> JSON Mode</Label>
                </div>

                {tableJsonMode ? (
                     <div>
                        <Label htmlFor="json-editor">JSON Data</Label>
                        <Textarea
                            id="json-editor"
                            value={jsonString}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            className={cn('min-h-[200px] font-code', { 'border-destructive': jsonError })}
                        />
                         {jsonError && <p className="text-sm text-destructive mt-2">{jsonError}</p>}
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label>Table Content</Label>
                            <div className="space-y-2 rounded-md border p-2">
                                {selectedComponent.headers.map((header, colIndex) => (
                                    <div key={colIndex} className="flex items-center gap-2">
                                        <Input value={header} onChange={e => handleHeaderChange(colIndex, e.target.value)} placeholder={`Header ${colIndex + 1}`} className="font-bold"/>
                                        <Button variant="ghost" size="icon" onClick={() => removeColumn(colIndex)} disabled={selectedComponent.headers.length <= 1}>
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                                {selectedComponent.rows.map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex items-center gap-2">
                                        {row.map((cell, colIndex) => (
                                            <Input key={colIndex} value={cell} onChange={(e) => handleTableChange(rowIndex, colIndex, e.target.value)} />
                                        ))}
                                        <Button variant="ghost" size="icon" onClick={() => removeRow(rowIndex)}>
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={addRow} variant="outline" size="sm">Add Row</Button>
                            <Button onClick={addColumn} variant="outline" size="sm">Add Column</Button>
                        </div>
                    </>
                )}
            </div>
        )
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

export default function PropertyEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const isNew = id === 'new';
  
  const [property, setProperty] = useState<Partial<Property>>({
      title: '',
      location: '',
      price: 0,
      type: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      area: 0,
      images: ['https://placehold.co/600x400.png']
  });
  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!isNew && id) {
      getPropertyById(id).then(existingProperty => {
        if (existingProperty) {
          setProperty({
            ...existingProperty,
            price: existingProperty.price ?? 0,
            bedrooms: existingProperty.bedrooms ?? 0,
            bathrooms: existingProperty.bathrooms ?? 0,
            area: existingProperty.area ?? 0,
          });
          setComponents(generateInitialComponents(existingProperty.description || ''));
        } else {
          toast({ title: "Property not found", variant: "destructive" });
          router.push('/admin');
        }
        setLoading(false);
      });
    }
  }, [id, isNew, router, toast]);

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  const handleUpdateComponent = (id: string, newProps: Partial<BuilderComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...newProps } : c));
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    
    // Dropping from Toolbox to Canvas
    if (active.id.toString().startsWith('toolbox-')) {
        const type = active.data.current?.type as BuilderComponent['type'];
        let newComponent: BuilderComponent;

        switch (type) {
            case 'Text':
                newComponent = { id: uuidv4(), type: 'Text', text: 'New Text Block', size: 'md' };
                break;
            case 'Button':
                newComponent = { id: uuidv4(), type: 'Button', text: 'New Button' };
                break;
            case 'Table':
                newComponent = { id: uuidv4(), type: 'Table', headers: ['Feature', 'Value'], rows: [['Bedrooms', '3'], ['Bathrooms', '2']] };
                break;
            default:
                return;
        }

        const overIndex = over.id === 'canvas' ? components.length : components.findIndex(c => c.id === over.id);

        if (overIndex !== -1) {
             const newItems = [...components];
             newItems.splice(overIndex, 0, newComponent);
             setComponents(newItems);
        } else {
             setComponents(prev => [...prev, newComponent]);
        }
        
        setSelectedComponentId(newComponent.id);
        return;
    }
    
    // Reordering in Canvas
    if (active.id !== over.id) {
        setComponents(items => {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return items; // Should not happen
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  };
  
  const handleSave = async () => {
    const descriptionHtml = componentToHtml(components);
    const propertyData = { ...property, description: descriptionHtml };

    try {
        if (isNew) {
            await createProperty(propertyData as Omit<Property, 'id'>);
            toast({ title: "Property Created!", description: "The new property has been saved." });
        } else {
            await updateProperty({ ...propertyData, id } as Property);
            toast({ title: "Property Updated!", description: "Your changes have been saved." });
        }
        router.push('/admin');
        router.refresh(); // To reflect changes in the admin list
    } catch (error) {
        toast({
            title: "Error Saving Property",
            description: "There was an error saving the property details.",
            variant: "destructive",
        });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const isNumericField = ['price', 'bedrooms', 'bathrooms', 'area'].includes(name);

      setProperty(prev => ({ 
          ...prev, 
          [name]: isNumericField ? (value === '' ? 0 : parseFloat(value)) : value 
      }));
  };

  const activeComponentType = activeId && activeId.toString().startsWith('toolbox-') ? activeId.toString().split('-')[1] as BuilderComponent['type'] : null;
  
  if (loading && !isNew) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <ClientOnly>
      <DndContext onDragEnd={handleDragEnd} onDragStart={e => setActiveId(e.active.id.toString())} sensors={sensors}>
        <div className="flex flex-col h-screen bg-background text-foreground">
          <header className="flex items-center justify-between p-4 border-b">
              <h1 className="text-2xl font-bold font-headline">{isNew ? 'Create New Property' : `Editing: ${property.title}`}</h1>
              <Button onClick={handleSave}>
                  <Save className="mr-2" />
                  {isNew ? 'Save Property' : 'Update Property'}
              </Button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] flex-grow overflow-hidden">
              {/* Main Edit Area */}
              <div className="flex flex-col overflow-y-auto">
                  {/* Property Details Form */}
                  <div className="p-6 border-b">
                     <Card>
                         <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <Label htmlFor="title">Title</Label>
                                  <Input id="title" name="title" value={property.title || ''} onChange={handleInputChange} />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="location">Location</Label>
                                  <Input id="location" name="location" value={property.location || ''} onChange={handleInputChange} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="price">Price (per month)</Label>
                                  <Input id="price" name="price" type="number" value={property.price || 0} onChange={handleInputChange} />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="type">Type</Label>
                                  <Input id="type" name="type" value={property.type || ''} onChange={handleInputChange} />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="bedrooms">Bedrooms</Label>
                                  <Input id="bedrooms" name="bedrooms" type="number" value={property.bedrooms || 0} onChange={handleInputChange} />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="bathrooms">Bathrooms</Label>
                                  <Input id="bathrooms" name="bathrooms" type="number" value={property.bathrooms || 0} onChange={handleInputChange} />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="area">Area (sqft)</Label>
                                  <Input id="area" name="area" type="number" value={property.area || 0} onChange={handleInputChange} />
                              </div>
                         </CardContent>
                     </Card>
                  </div>

                  {/* Description Builder */}
                   <div className="p-6 flex-grow flex flex-col">
                      <h2 className="text-xl font-bold mb-4">Property Description Builder</h2>
                      <div className="grid grid-cols-[250px_1fr] flex-grow gap-6 h-full min-h-[500px]">
                          <Toolbox />
                          <Canvas components={components} setComponents={setComponents} selectedComponentId={selectedComponentId} setSelectedComponentId={setSelectedComponentId} />
                      </div>
                  </div>
              </div>

              {/* Properties Panel */}
              <div className="p-4 border-l h-full overflow-y-auto">
                  <PropertiesPanel selectedComponent={selectedComponent} onUpdate={handleUpdateComponent} />
              </div>
          </div>
        </div>

        <DragOverlay>
          {activeComponentType ? (
            <div className="flex items-center gap-4 p-2 bg-primary text-primary-foreground rounded-lg border cursor-grabbing shadow-lg">
               {activeComponentType === 'Text' && <Type className="w-6 h-6" />}
               {activeComponentType === 'Button' && <RectangleHorizontal className="w-6 h-6" />}
               {activeComponentType === 'Table' && <TableIcon className="w-6 h-6" />}
               <span className="font-medium">{activeComponentType}</span>
             </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ClientOnly>
  );
}
