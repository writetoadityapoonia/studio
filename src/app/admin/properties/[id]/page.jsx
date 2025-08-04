
'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDroppable, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Type, RectangleHorizontal, Save, GripVertical, TableIcon, Code, Blocks, Image as ImageIcon, Minus, Divide, Copy, Check, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createProperty, updateProperty } from '@/lib/actions';
import { getPropertyById, getPropertyTypes } from '@/lib/data';
import { useRouter, useParams } from 'next/navigation';
import { Toolbox, parseDescription } from '@/components/builder-elements';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientOnly } from '@/components/client-only';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CldUploadWidget } from 'next-cloudinary';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/cloudinary';
import Autocomplete from 'react-google-autocomplete';
import { Checkbox } from '@/components/ui/checkbox';

const AVAILABLE_AMENITIES = [
    "Swimming Pool", "Gymnasium", "Clubhouse", "24x7 Security", "Power Backup", 
    "Lifts", "Car Parking", "Children's Play Area", "Garden", "Intercom"
];

const AI_PROMPT = `You are an expert content migration specialist. Your task is to take raw text or HTML and convert it into a structured JSON array that can be used by a web application's description builder.

**Your Goal:** Convert the provided text/HTML into a valid JSON array of components. The final output must be only the JSON array, without any commentary or wrapper.

**JSON Component Schema:**

You must use the following component types and schemas:

1.  **Text**: For headings and paragraphs.
    *   \`{ "id": "uuid", "type": "Text", "text": "...", "size": "sm|md|lg|xl", "align": "left|center|right", "color": "default|primary|muted", "style": ["bold", "italic"] }\`
2.  **Table**: For structured data.
    *   \`{ "id": "uuid", "type": "Table", "headers": ["Header1", "Header2"], "rows": [["r1c1", "r1c2"], ["r2c1", "r2c2"]] }\`
3.  **Image**: For images.
    *   \`{ "id": "uuid", "type": "Image", "src": "url", "alt": "description" }\`
4.  **Spacer**: For adding vertical space.
    *   \`{ "id": "uuid", "type": "Spacer", "size": "sm|md|lg" }\`
5.  **Divider**: For a horizontal rule.
    *   \`{ "id": "uuid", "type": "Divider" }\`

**Instructions:**

1.  **Analyze the Input**: Read the provided content (which can be plain text or HTML) and identify the different sections.
2.  **Generate IDs**: For each component object, generate a unique UUID for the "id" field.
3.  **Map HTML/Text to Components**:
    *   \`<h1>\`, \`<h2>\`: Map to "Text" components with \`size: "xl"\` or \`"lg"\`.
    *   \`<p>\`: Map to "Text" component with \`size: "md"\`.
    *   \`<b>\`, \`<strong>\`: Use the "style" array with a value of \`"bold"\`.
    *   \`<i>\`, \`<em>\`: Use the "style" array with a value of \`"italic"\`.
    *   \`<ul>\`, \`<ol>\`: Convert lists into a single "Text" component, using newline characters (\\n) and dashes (-) or numbers to format the list items.
    *   \`<br>\`: Can be interpreted as a "Spacer" component or preserved as newlines within a "Text" component.
    *   \`<img>\`: Map to an "Image" component, extracting the \`src\` and \`alt\` attributes.
    *   \`<table>\`: Map to a "Table" component, parsing \`<thead>\`, \`<tbody>\`, \`<tr>\`, \`<th>\`, and \`<td>\` tags to populate the headers and rows.
    *   \`<hr>\`: Map to a "Divider" component.
4.  **Return JSON only**: Your entire output must be a single, valid JSON array.

**Example Input HTML:**
\`<h1>Sunshine Apartments</h1><p>A beautiful place to live with <strong>2 bedrooms</strong> and a great city view. It is <i>1200 sqft</i>.</p><hr><h2>Amenities</h2><ul><li>Swimming Pool</li><li>Gym</li></ul>\`

**Example Output JSON:**
\`[
  {"id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6", "type": "Text", "text": "Sunshine Apartments", "size": "xl", "align": "left", "color": "default", "style": ["bold"]},
  {"id": "b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7", "type": "Text", "text": "A beautiful place to live with 2 bedrooms and a great city view. It is 1200 sqft.", "size": "md", "align": "left", "color": "default", "style": []},
  {"id": "c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8", "type": "Divider"},
  {"id": "d4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8g9", "type": "Text", "text": "Amenities", "size": "lg", "align": "left", "color": "default", "style": ["bold"]},
  {"id": "e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8g9h0", "type": "Text", "text": "- Swimming Pool\\n- Gym", "size": "md", "align": "left", "color": "default", "style": []}
]\`
`;


function PromptCard() {
    const { toast } = useToast();
    const [hasCopied, setHasCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(AI_PROMPT);
        setHasCopied(true);
        toast({ title: "Prompt Copied!", description: "The AI prompt has been copied to your clipboard." });
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle>AI Prompt for JSON Generation</CardTitle>
                <CardDescription>
                    Use this prompt with an external AI (like Gemini or ChatGPT) to convert plain text or HTML into the required JSON format.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-md max-h-[400px] overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-code">{AI_PROMPT}</pre>
                </div>
                <Button onClick={copyToClipboard} className="w-full">
                    {hasCopied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
                    {hasCopied ? 'Copied!' : 'Copy Prompt'}
                </Button>
            </CardContent>
        </Card>
    );
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group cursor-grab">
      {children}
    </div>
  );
}

const CanvasComponent = ({ component, selected, onSelect, onDelete }) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'Text': {
        const fontSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
        const fontColorMap = { default: 'text-foreground', primary: 'text-primary', muted: 'text-muted-foreground' };
        const textAlignMap = { left: 'text-left', center: 'text-center', right: 'text-right' };
        return <p className={cn(
            "py-2 w-full",
            fontSizeMap[component.size],
            fontColorMap[component.color],
            textAlignMap[component.align],
            { 'font-bold': component.style.includes('bold') },
            { 'italic': component.style.includes('italic') },
        )}>{component.text || "Empty Text"}</p>;
      }
      case 'Button': {
          const buttonContent = (
            <Button variant={component.variant} size={component.size}>{component.text}</Button>
          );
          if (component.href) {
              return <a href={component.href} target="_blank" rel="noopener noreferrer">{buttonContent}</a>
          }
          return buttonContent;
      }
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
       case 'Image':
            return (
                <div className="flex justify-center">
                    <Image src={component.src || 'https://placehold.co/600x400.png'} alt={component.alt} width={600} height={400} className="rounded-md object-cover" data-ai-hint="property element" />
                </div>
            )
       case 'Spacer': {
           const sizeMap = { sm: 'h-4', md: 'h-8', lg: 'h-16' };
            return <div className={cn("w-full", sizeMap[component.size])}></div>
       }
       case 'Divider':
            return <Separator className="my-4" />
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
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                onDelete(component.id);
            }}>
                <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
        </div>
      {renderComponent()}
    </div>
  );
};

const Canvas = ({ components, selectedComponentId, onSelect, onDelete, onSort }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div ref={setNodeRef} id="canvas" className={cn("w-full h-full bg-muted/30 rounded-lg p-8 space-y-2 overflow-y-auto", {"bg-primary/10": isOver})}>
      <SortableContext items={components.map(c => c.id)} strategy={rectSortingStrategy}>
        {components.length > 0 ? (
          components.map(component => (
            <SortableItem key={component.id} id={component.id}>
              <CanvasComponent
                component={component}
                selected={selectedComponentId === component.id}
                onSelect={() => onSelect(component.id)}
                onDelete={onDelete}
              />
            </SortableItem>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Plus className="w-12 h-12 mb-4" />
            <p>Drag elements from the toolbox here.</p>
          </div>
        )}
      </SortableContext>
    </div>
  );
};


const PropertiesPanel = ({ selectedComponent, onUpdate }) => {
  const [tableJsonMode, setTableJsonMode] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState(null);

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

  const handleJsonChange = (value) => {
    setJsonString(value);
    try {
        const parsed = JSON.parse(value);
        if (
            !parsed ||
            !Array.isArray(parsed.headers) ||
            !Array.isArray(parsed.rows) ||
            parsed.rows.some((r) => !Array.isArray(r))
        ) {
            throw new Error('Invalid JSON structure. Must have "headers" and "rows" arrays.');
        }
        onUpdate(selectedComponent.id, { headers: parsed.headers, rows: parsed.rows });
        setJsonError(null);
    } catch (error) {
        setJsonError(error.message);
    }
  };


    const handleTableChange = (rowIndex, colIndex, value) => {
        if (selectedComponent.type !== 'Table') return;
        const newRows = [...selectedComponent.rows];
        newRows[rowIndex][colIndex] = value;
        onUpdate(selectedComponent.id, { rows: newRows });
    };

    const handleHeaderChange = (colIndex, value) => {
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

    const removeRow = (index) => {
        if (selectedComponent.type !== 'Table') return;
        const newRows = selectedComponent.rows.filter((_, i) => i !== index);
        onUpdate(selectedComponent.id, { rows: newRows });
    }
    
    const removeColumn = (index) => {
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
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Font Size</Label>
                  <Select value={selectedComponent.size} onValueChange={(value) => onUpdate(selectedComponent.id, { size: value })}>
                      <SelectTrigger id="size"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="md">Medium</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                          <SelectItem value="xl">Extra Large</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                   <Select value={selectedComponent.color} onValueChange={(value) => onUpdate(selectedComponent.id, { color: value })}>
                      <SelectTrigger id="color"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="muted">Muted</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
             </div>
             <div>
                <Label>Alignment</Label>
                <ToggleGroup type="single" value={selectedComponent.align} onValueChange={(value) => value && onUpdate(selectedComponent.id, { align: value })} className="w-full">
                  <ToggleGroupItem value="left" aria-label="Align left" className="w-full"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center" className="w-full"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right" className="w-full"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                </ToggleGroup>
             </div>
             <div>
                <Label>Style</Label>
                <ToggleGroup type="multiple" value={selectedComponent.style} onValueChange={(value) => onUpdate(selectedComponent.id, { style: value })} className="w-full">
                  <ToggleGroupItem value="bold" aria-label="Bold" className="w-full"><Bold className="h-4 w-4" /></ToggleGroupItem>
                  <ToggleGroupItem value="italic" aria-label="Italic" className="w-full"><Italic className="h-4 w-4" /></ToggleGroupItem>
                </ToggleGroup>
             </div>
          </div>
        );
      case 'Button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Button Text</Label>
              <Input
                id="text"
                value={selectedComponent.text}
                onChange={(e) => onUpdate(selectedComponent.id, { text: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                placeholder="https://example.com"
                value={selectedComponent.href}
                onChange={(e) => onUpdate(selectedComponent.id, { href: e.target.value })}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variant">Variant</Label>
                  <Select value={selectedComponent.variant} onValueChange={(value) => onUpdate(selectedComponent.id, { variant: value })}>
                      <SelectTrigger id="variant"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="destructive">Destructive</SelectItem>
                          <SelectItem value="outline">Outline</SelectItem>
                          <SelectItem value="ghost">Ghost</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                   <Select value={selectedComponent.size} onValueChange={(value) => onUpdate(selectedComponent.id, { size: value })}>
                      <SelectTrigger id="size"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                          <SelectItem value="icon">Icon</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
             </div>
          </div>
        );
      case 'Image':
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="src">Image URL</Label>
                    <Input id="src" value={selectedComponent.src} onChange={(e) => onUpdate(selectedComponent.id, { src: e.target.value })} placeholder="https://placehold.co/600x400.png" />
                </div>
                <div>
                    <Label htmlFor="alt">Alt Text</Label>
                    <Input id="alt" value={selectedComponent.alt} onChange={(e) => onUpdate(selectedComponent.id, { alt: e.target.value })} placeholder="Descriptive text for the image" />
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
        );
    case 'Spacer':
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="size">Height</Label>
                    <Select value={selectedComponent.size} onValueChange={(value) => onUpdate(selectedComponent.id, { size: value })}>
                        <SelectTrigger id="size"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sm">Small (16px)</SelectItem>
                            <SelectItem value="md">Medium (32px)</SelectItem>
                            <SelectItem value="lg">Large (64px)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
     case 'Divider':
        return (
            <div>
                 <p className="text-muted-foreground text-sm">This component is a visual separator. It has no properties to edit.</p>
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


const ImageSortableItem = ({ id, children, listeners, attributes }) => {
  const { setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
       {React.cloneElement(children, { listeners })}
    </div>
  );
};

function ImageGrid({ images, onRemove, onReorder }) {
    const sensors = useSensors(useSensor(PointerSensor));

    function handleDragEnd(event) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((img) => img === active.id);
            const newIndex = images.findIndex((img) => img === over.id);
            onReorder(oldIndex, newIndex);
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {images.map((url) => (
                         <ImageSortableItemWrapper key={url} id={url} onRemove={() => onRemove(url)}>
                            <Image
                                src={url}
                                alt="Property image"
                                fill
                                className="object-cover rounded-md"
                            />
                        </ImageSortableItemWrapper>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

const ImageSortableItemWrapper = ({ id, onRemove, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative aspect-square w-full group cursor-grab">
             {children}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(id);
                }}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
};

function DeleteDropzone({ visible }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'delete-dropzone',
    });

    if (!visible) return null;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'fixed bottom-6 right-1/2 translate-x-1/2 z-50 flex h-24 w-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive bg-destructive/10 text-destructive transition-all',
                { 'scale-110 bg-destructive/20': isOver }
            )}
        >
            <Trash2 className="h-8 w-8" />
            <p className="mt-2 text-sm font-medium">Drop here to delete</p>
        </div>
    );
}

const defaultPropertyState = {
    title: '',
    location: { address: '', locality: '', lat: 0, lng: 0 },
    bhk: '1BHK',
    price: 0,
    propertyType: '',
    builtUpArea: 0,
    furnishing: 'Unfurnished',
    projectName: '',
    description: '[]',
    images: [],
    floor: 0,
    age: 'New',
    facing: 'North',
    amenities: [],
    ownerContact: '',
};

function PropertyEditForm({ property: initialProperty, propertyTypes, isNew }) {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { toast } = useToast();
  
  const [property, setProperty] = useState({
      ...defaultPropertyState,
      ...initialProperty,
      location: { ...defaultPropertyState.location, ...initialProperty?.location }
  });

  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [descriptionMode, setDescriptionMode] = useState('builder');
  const sensors = useSensors(useSensor(PointerSensor));
  
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isCloudinaryConfigured = CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' && CLOUDINARY_UPLOAD_PRESET && CLOUDINARY_UPLOAD_PRESET !== 'your_upload_preset_name';
  const karnatakaBounds = {
    north: 18.46,
    south: 11.59,
    west: 74.05,
    east: 78.58,
  };

  useEffect(() => {
    const initialComponents = parseDescription(initialProperty.description || '[]');
    setComponents(initialComponents);
  }, [initialProperty]);

  useEffect(() => {
    const savedMode = localStorage.getItem('property-editor-mode');
    if (savedMode) {
      setDescriptionMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('property-editor-mode', descriptionMode);
  }, [descriptionMode]);
  
  useEffect(() => {
    setProperty(p => ({...p, description: JSON.stringify(components)}));
  }, [components]);

  const selectedComponent = components.find(c => c.id === selectedComponentId) || null;

  const handleUpdateComponent = (id, newProps) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...newProps } : c));
  };
  
  const handleDeleteComponent = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedComponentId === id) {
        setSelectedComponentId(null);
    }
  };

  const handleSortComponents = (oldIndex, newIndex) => {
    setComponents(prev => arrayMove(prev, oldIndex, newIndex));
  };

  const handleAddComponent = (type, overId) => {
    let newComponent;
    const id = uuidv4();
    switch (type) {
        case 'Text':
            newComponent = { id, type: 'Text', text: 'New Text Block', size: 'md', align: 'left', color: 'default', style: [] };
            break;
        case 'Button':
            newComponent = { id, type: 'Button', text: 'Click Me', href: '', variant: 'default', size: 'default' };
            break;
        case 'Table':
            newComponent = { id, type: 'Table', headers: ['Feature', 'Value'], rows: [['Bedrooms', '3'], ['Bathrooms', '2']] };
            break;
        case 'Image':
            newComponent = { id, type: 'Image', src: 'https://placehold.co/600x400.png', alt: 'Placeholder image' };
            break;
        case 'Spacer':
            newComponent = { id, type: 'Spacer', size: 'md' };
            break;
        case 'Divider':
            newComponent = { id, type: 'Divider' };
            break;
        default: return;
    }
    
    setComponents(prev => {
        const overIndex = overId === 'canvas' ? prev.length : prev.findIndex(c => c.id === overId);
        if (overIndex !== -1) {
            return [...prev.slice(0, overIndex + 1), newComponent, ...prev.slice(overIndex + 1)];
        }
        return [...prev, newComponent];
    });
    setSelectedComponentId(id);
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    
    if (over.id === 'delete-dropzone' && !active.id.toString().startsWith('toolbox-')) {
        handleDeleteComponent(active.id);
        return;
    }
    
    // Handle adding new component from toolbox
    if (active.id.toString().startsWith('toolbox-') && over.id) {
        const type = active.data.current?.type;
        handleAddComponent(type, over.id === 'canvas' ? 'canvas' : over.id);
        return;
    }

    // Handle sorting existing components
    if (active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
          handleSortComponents(oldIndex, newIndex);
      }
    }
  };
  
  const handleSave = async () => {
    let descriptionToSave = property.description;
    
    if (descriptionMode === 'builder') {
        descriptionToSave = JSON.stringify(components);
    } else if (descriptionMode === 'json') {
        try {
            JSON.parse(property.description || '[]');
            descriptionToSave = property.description;
        } catch(e) {
            toast({ title: "Invalid JSON", description: "Could not save. Please fix the JSON in the Raw JSON editor.", variant: "destructive"});
            return;
        }
    }

    const propertyData = { ...property, description: descriptionToSave };

    try {
        if (isNew) {
            await createProperty(propertyData);
            toast({ title: "Property Created!", description: "The new property has been saved." });
        } else {
            await updateProperty({ ...propertyData, id });
            toast({ title: "Property Updated!", description: "Your changes have been saved." });
        }
        router.push('/admin');
        router.refresh(); 
    } catch (error) {
        console.error("Save error:", error);
        toast({
            title: "Error Saving Property",
            description: error.message || "There was an error saving the property details.",
            variant: "destructive",
        });
    }
  };
  
  const handleInputChange = (e) => {
      const { name, value } = e.target;
      const isNumericField = ['price', 'builtUpArea', 'floor'].includes(name);

      setProperty(prev => ({ 
          ...prev, 
          [name]: isNumericField ? (value === '' ? 0 : parseFloat(value)) : value 
      }));
  };

  const handleDescriptionModeChange = (checked) => {
    const newMode = checked ? 'json' : 'builder';
    if (newMode === 'json') {
      setProperty(p => ({...p, description: JSON.stringify(components, null, 2)}));
    } else {
      try {
        const parsedComponents = parseDescription(property.description || '[]');
        setComponents(parsedComponents);
      } catch (e) {
        toast({ title: "Invalid JSON", description: "Could not parse JSON, staying in raw mode.", variant: 'destructive' });
        setDescriptionMode('json');
        return;
      }
    }
    setDescriptionMode(newMode);
  };
  
  const handleRawJsonChange = (e) => {
    const newDescription = e.target.value;
    setProperty(prev => ({...prev, description: newDescription}));
    try {
        JSON.parse(newDescription);
    } catch(e) {
        // Don't toast here, it would be annoying on every keystroke
    }
  }

  const handleAmenityChange = (amenity, checked) => {
    setProperty(prev => {
        const currentAmenities = prev.amenities || [];
        if (checked) {
            return { ...prev, amenities: [...currentAmenities, amenity] };
        } else {
            return { ...prev, amenities: currentAmenities.filter(a => a !== amenity) };
        }
    });
  }


  const handleImageUpload = (result) => {
      setProperty(prev => ({
          ...prev,
          images: [...(prev.images || []), result.info.secure_url]
      }));
  };

  const handleRemoveImage = (url) => {
      setProperty(prev => ({
          ...prev,
          images: prev.images.filter(img => img !== url)
      }));
  };

  const handleReorderImages = (oldIndex, newIndex) => {
      setProperty(prev => ({
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex)
      }));
  };
  
  const handlePlaceSelected = (place) => {
    if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const localityComponent = place.address_components.find(c => c.types.includes('locality'));
        const locality = localityComponent ? localityComponent.long_name : '';
        
        setProperty(prev => ({
            ...prev,
            location: {
                ...prev.location,
                address: place.formatted_address,
                locality,
                lat,
                lng
            }
        }));
    }
  };

  const activeComponentType = activeId && activeId.toString().startsWith('toolbox-') ? activeId.toString().split('-')[1] : null;
  const isDraggingCanvasItem = activeId && !activeId.toString().startsWith('toolbox-');

  return (
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
        <div className="flex flex-col h-screen bg-background text-foreground">
          <header className="flex items-center justify-between p-4 border-b">
              <h1 className="text-2xl font-bold font-headline">{isNew ? 'Create New Property' : `Editing: ${property.title}`}</h1>
              <Button onClick={handleSave}>
                  <Save className="mr-2" />
                  {isNew ? 'Save Property' : 'Update Property'}
              </Button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] flex-grow overflow-hidden">
              <div className="flex flex-col overflow-y-auto p-6 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Core Details</CardTitle>
                    </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="title">Title</Label>
                              <Input id="title" name="title" value={property.title || ''} onChange={handleInputChange} />
                          </div>
                           <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="location">Location Search</Label>
                              {GOOGLE_MAPS_API_KEY ? (
                                <Autocomplete
                                    apiKey={GOOGLE_MAPS_API_KEY}
                                    onPlaceSelected={handlePlaceSelected}
                                    options={{ 
                                        types: ["geocode"],
                                        componentRestrictions: { country: "in" },
                                        bounds: karnatakaBounds,
                                        strictBounds: false
                                    }}
                                    defaultValue={property.location?.address || ''}
                                    className={cn(
                                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    )}
                                />
                               ) : (
                                 <Input name="location.address" value={property.location?.address || ''} onChange={(e) => setProperty(p => ({...p, location: {...p.location, address: e.target.value}}))} />
                               )}
                                 {property.location?.lat && (
                                     <div className="mt-2 text-sm text-muted-foreground">
                                         Lat: {property.location.lat.toFixed(4)}, Lng: {property.location.lng.toFixed(4)}
                                     </div>
                                 )}
                          </div>
                           <div className="space-y-2">
                              <Label htmlFor="projectName">Project Name</Label>
                              <Input id="projectName" name="projectName" value={property.projectName || ''} onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="price">Price (in INR)</Label>
                              <Input id="price" name="price" type="number" value={property.price || 0} onChange={handleInputChange} />
                          </div>
                           <div className="space-y-2">
                              <Label htmlFor="propertyType">Property Type</Label>
                              <Select 
                                value={property.propertyType || ''} 
                                onValueChange={(value) => setProperty(prev => ({ ...prev, propertyType: value }))}
                              >
                                <SelectTrigger id="propertyType">
                                    <SelectValue placeholder="Select a property type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {propertyTypes.map(type => (
                                        <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="builtUpArea">Built-up Area (sqft)</Label>
                              <Input id="builtUpArea" name="builtUpArea" type="number" value={property.builtUpArea || 0} onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="bhk">BHK</Label>
                               <Select value={property.bhk} onValueChange={(value) => setProperty(prev => ({...prev, bhk: value}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['1BHK', '2BHK', '3BHK', '4BHK', '5BHK+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                               </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="furnishing">Furnishing</Label>
                               <Select value={property.furnishing} onValueChange={(value) => setProperty(prev => ({...prev, furnishing: value}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                               </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="floor">Floor</Label>
                              <Input id="floor" name="floor" type="number" value={property.floor || 0} onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="age">Age of Property</Label>
                              <Select value={property.age} onValueChange={(value) => setProperty(prev => ({...prev, age: value}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['New', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                               </Select>
                          </div>
                           <div className="space-y-2">
                              <Label htmlFor="facing">Facing</Label>
                              <Select value={property.facing} onValueChange={(value) => setProperty(prev => ({...prev, facing: value}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                               </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="ownerContact">Owner Contact</Label>
                              <Input id="ownerContact" name="ownerContact" value={property.ownerContact || ''} onChange={handleInputChange} />
                          </div>

                     </CardContent>
                 </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {AVAILABLE_AMENITIES.map(amenity => (
                            <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`amenity-${amenity}`}
                                    checked={property.amenities?.includes(amenity)}
                                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                                />
                                <label htmlFor={`amenity-${amenity}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {amenity}
                                </label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Property Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ImageGrid images={property.images || []} onRemove={handleRemoveImage} onReorder={handleReorderImages} />
                        <CldUploadWidget 
                          cloudName={CLOUDINARY_CLOUD_NAME}
                          uploadPreset={CLOUDINARY_UPLOAD_PRESET} 
                          onSuccess={handleImageUpload}
                        >
                            {({ open }) => {
                                function handleOnClick(e) {
                                    e.preventDefault();
                                    open();
                                }
                                return (
                                    <Button type="button" variant="outline" onClick={handleOnClick} className="w-full" disabled={!isCloudinaryConfigured}>
                                        <UploadCloud className="mr-2" />
                                        Upload an Image
                                    </Button>
                                );
                            }}
                        </CldUploadWidget>
                        {!isCloudinaryConfigured && (
                            <p className="text-sm text-destructive text-center">
                              Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env file.
                            </p>
                        )}
                    </CardContent>
                </Card>


                   <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold">Property Description</h2>
                         </div>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="description-mode" className="flex items-center gap-2 text-sm">
                                <Blocks className="w-4 h-4"/> Builder
                            </Label>
                            <Switch id="description-mode" checked={descriptionMode === 'json'} onCheckedChange={handleDescriptionModeChange} />
                            <Label htmlFor="description-mode" className="flex items-center gap-2 text-sm">
                                <Code className="w-4 h-4"/> Raw JSON
                            </Label>
                        </div>
                      </div>

                      {descriptionMode === 'builder' ? (
                        <div className="grid grid-cols-[250px_1fr] flex-grow gap-6 h-full min-h-[500px]">
                            <Toolbox />
                             <Canvas 
                                components={components}
                                selectedComponentId={selectedComponentId}
                                onSelect={setSelectedComponentId}
                                onDelete={handleDeleteComponent}
                                onSort={handleSortComponents}
                            />
                        </div>
                      ) : (
                        <Textarea 
                            name="description"
                            value={property.description || ''}
                            onChange={handleRawJsonChange}
                            className="w-full flex-grow min-h-[500px] font-code"
                            placeholder="Enter property description as a JSON array here..."
                        />
                      )}
                  </div>
              </div>

              <div className="p-4 border-l h-full overflow-y-auto">
                  {descriptionMode === 'builder' ? (
                     <PropertiesPanel selectedComponent={selectedComponent} onUpdate={handleUpdateComponent} />
                  ) : (
                     <PromptCard />
                  )}
              </div>
          </div>
        </div>
        
        <DeleteDropzone visible={isDraggingCanvasItem} />

        <DragOverlay>
          {activeId && activeComponentType ? (
            <div className="flex items-center gap-4 p-2 bg-primary text-primary-foreground rounded-lg border cursor-grabbing shadow-lg">
               {activeComponentType === 'Text' && <Type className="w-6 h-6" />}
               {activeComponentType === 'Button' && <RectangleHorizontal className="w-6 h-6" />}
               {activeComponentType === 'Table' && <TableIcon className="w-6 h-6" />}
               {activeComponentType === 'Image' && <ImageIcon className="w-6 h-6" />}
               {activeComponentType === 'Spacer' && <Minus className="w-6 h-6" />}
               {activeComponentType === 'Divider' && <Divide className="w-6 h-6" />}
               <span className="font-medium">{activeComponentType}</span>
             </div>
          ) : activeId ? (
              components.find(c => c.id === activeId) &&
              <div className="p-4 bg-background rounded-lg shadow-lg cursor-grabbing">
                <CanvasComponent component={components.find(c => c.id === activeId)} selected={false} onSelect={() => {}} onDelete={() => {}} />
              </div>
          ) : null}
        </DragOverlay>
      </DndContext>
  )
}


export default function PropertyEditPage() {
  const params = useParams();
  const id = params.id;
  const { toast } = useToast();
  const isNew = id === 'new';
  
  const [property, setProperty] = useState(null);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  

  useEffect(() => {
    getPropertyTypes().then(setPropertyTypes);

    if (!isNew && id) {
      setLoading(true);
      getPropertyById(id).then(existingProperty => {
        if (existingProperty) {
          setProperty(existingProperty);
        } else {
          toast({ title: "Property not found", variant: "destructive" });
        }
        setLoading(false);
      });
    } else {
        setProperty({});
    }
  }, [id, isNew, toast]);
  
  if (loading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>
  }
  
  if (!property && !isNew) {
      return <div className="flex h-screen items-center justify-center">Property not found.</div>
  }

  return (
    <ClientOnly>
       <PropertyEditForm 
            property={property}
            propertyTypes={propertyTypes}
            isNew={isNew}
       />
    </ClientOnly>
  );
}
