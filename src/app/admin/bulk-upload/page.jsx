
'use client';

import { useState, useTransition } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Check, Copy, Loader2, TableIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { bulkCreateProperties } from '@/lib/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const CSV_TEMPLATE_HEADERS = ['title', 'location', 'developer', 'price', 'type', 'bedrooms', 'bathrooms', 'area', 'images', 'description'];
const CSV_TEMPLATE_DATA = [
    ['Elegant 3BHK Apartment', 'Koramangala, Bengaluru', 'Prestige Group', 15000000, 'Apartment', 3, 2, 1600, 'https://placehold.co/800x600.png,https://placehold.co/800x600.png', '[{"id":"a1b2c3d4","type":"Text","text":"A beautiful apartment."}]'],
    ['Luxury Villa with Pool', 'Whitefield, Bengaluru', 'Sobha Ltd', 50000000, 'Villa', 4, 4, 3500, 'https://placehold.co/800x600.png', '[]']
];

const AI_PROMPT = `You are an expert real estate data entry specialist and content migrator. Your task is to convert unstructured text or HTML describing multiple properties into a structured CSV format.

**Your Goal:** Convert the provided text into a single, valid CSV string. The first line of the CSV must be the header row, and all subsequent rows will be the property data.

**CSV Headers (must be in this order):**
\`title,location,developer,price,type,bedrooms,bathrooms,area,images,description\`

**Column Instructions:**

1.  **title**: The main title of the property listing.
2.  **location**: The address or neighborhood of the property.
3.  **developer**: The name of the construction company or developer.
4.  **price**: The price of the property in Indian Rupees (INR). Provide this as a number without commas or currency symbols (e.g., \`15000000\`).
5.  **type**: The type of property (e.g., 'Apartment', 'Villa', 'Plot').
6.  **bedrooms**: The number of bedrooms.
7.  **bathrooms**: The number of bathrooms.
8.  **area**: The size of the property in square feet (sqft).
9.  **images**: A comma-separated list of image URLs. For placeholders, use \`https://placehold.co/800x600.png\`.
10. **description (Important!)**: This must be a JSON array representing the property's detailed description. If the source text contains HTML or rich formatting, you must convert it to the JSON format specified below. If no description is available, use an empty array: \`[]\`.

**Description JSON Schema:**

*   **Text**: \`{ "id": "uuid", "type": "Text", "text": "...", "size": "sm|md|lg|xl", "align": "left|center|right", "color": "default|primary|muted", "style": ["bold", "italic"] }\`
*   **Table**: \`{ "id": "uuid", "type": "Table", "headers": ["Header1"], "rows": [["r1c1"]] }\`
*   **Image**: \`{ "id": "uuid", "type": "Image", "src": "url", "alt": "description" }\`
*   **Spacer**: \`{ "id": "uuid", "type": "Spacer", "size": "sm|md|lg" }\`
*   **Divider**: \`{ "id": "uuid", "type": "Divider" }\`

**Conversion Logic:**
*   Map \`<h1>\`, \`<h2>\` to "Text" components with appropriate sizes.
*   Map \`<p>\` tags to "Text" components.
*   Map \`<b>\` or \`<strong>\` to \`"style": ["bold"]\` in Text components.
*   Map lists (\`<ul>\`, \`<ol>\`) to a single "Text" component with newlines.
*   Map \`<img>\` tags to "Image" components.
*   Map \`<table>\` tags to "Table" components.
*   Map \`<hr>\` to "Divider" components.
*   You must generate a unique UUID for each component's "id" field.

**Return CSV only**: Your entire output must be a single, valid CSV formatted string.

**Example Input Text:**
"For sale: A 2-bedroom apartment in Indiranagar by Emaar. 1200 sqft, 1.2 Cr. Description: <h2>Overview</h2><p>A great place to live with <i>fantastic</i> views.</p>"

**Example Output CSV:**
title,location,developer,price,type,bedrooms,bathrooms,area,images,description
"2BHK Apartment in Indiranagar",Indiranagar,Emaar,12000000,Apartment,2,2,1200,"https://placehold.co/800x600.png","[{\\"id\\":\\"...",\\"type\\":\\"Text\\",\\"text\\":\\"Overview\\",\\"size\\":\\"lg\\",\\"align\\":\\"left\\",\\"color\\":\\"default\\",\\"style\\":[]},{\\"id\\":\\"...",\\"type\\":\\"Text\\",\\"text\\":\\"A great place to live with fantastic views.\\",\\"size\\":\\"md\\",\\"align\\":\\"left\\",\\"color\\":\\"default\\",\\"style\\":[\\"italic\\"]}]"
`;

function AiPromptCard() {
    const { toast } = useToast();
    const [hasCopied, setHasCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(AI_PROMPT);
        setHasCopied(true);
        toast({ title: "Prompt Copied!", description: "The AI prompt for CSV generation has been copied." });
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Prompt for CSV Generation</CardTitle>
                <CardDescription>
                    Use this prompt with an AI like Gemini or ChatGPT to convert plain text into the required CSV format for bulk uploading.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-md max-h-[300px] overflow-y-auto">
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


export default function BulkUploadPage() {
    const [file, setFile] = useState(null);
    const [csvText, setCsvText] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const parseCsv = (data) => {
        setIsParsing(true);
        Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const sanitizedData = results.data.map(row => ({
                    ...row,
                    price: parseFloat(row.price) || 0,
                    bedrooms: parseInt(row.bedrooms, 10) || 0,
                    bathrooms: parseInt(row.bathrooms, 10) || 0,
                    area: parseInt(row.area, 10) || 0,
                    images: row.images ? row.images.split(',').map(url => url.trim()) : [],
                    description: row.description || '[]'
                }));
                setParsedData(sanitizedData);
                setIsParsing(false);
            },
            error: (err) => {
                toast({ title: "Parsing Error", description: `Could not parse the CSV data. ${err.message}`, variant: "destructive" });
                setIsParsing(false);
            }
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setParsedData([]);
            parseCsv(selectedFile);
        }
    };

    const handlePasteParse = () => {
        if (!csvText.trim()) {
            toast({ title: "No Content", description: "Please paste your CSV content in the text area.", variant: "destructive" });
            return;
        }
        setParsedData([]);
        parseCsv(csvText);
    }

    const downloadTemplate = () => {
        const csvContent = [
            CSV_TEMPLATE_HEADERS.join(','),
            ...CSV_TEMPLATE_DATA.map(row =>
                row.map((cell, index) => {
                    if (index === 9) {
                        return `"${cell.replace(/"/g, '""')}"`;
                    }
                    return `"${cell}"`;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'property_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = () => {
        if (parsedData.length === 0) {
            toast({ title: "No Data", description: "There's no data to upload.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            try {
                const result = await bulkCreateProperties(parsedData);
                toast({ title: "Upload Successful", description: `${result.insertedCount} properties have been added.` });
                setFile(null);
                setParsedData([]);
                setCsvText('');
            } catch (error) {
                toast({ title: "Upload Failed", description: error.message || "An error occurred during bulk upload.", variant: "destructive" });
            }
        });
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Bulk Upload Properties</CardTitle>
                    <CardDescription>Upload properties by uploading a CSV file or pasting CSV content directly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs defaultValue="file">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="file">Upload File</TabsTrigger>
                            <TabsTrigger value="paste">Paste Content</TabsTrigger>
                        </TabsList>
                        <TabsContent value="file" className="pt-4 space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="csv-upload">Upload CSV File</Label>
                                <div className="flex gap-2">
                                    <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="flex-grow" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="paste" className="pt-4 space-y-4">
                           <div className="space-y-2">
                             <Label htmlFor="csv-paste">Paste CSV Content</Label>
                             <Textarea 
                                id="csv-paste" 
                                value={csvText} 
                                onChange={(e) => setCsvText(e.target.value)}
                                placeholder="title,location,price..."
                                className="min-h-[150px] font-code text-xs"
                              />
                           </div>
                           <Button onClick={handlePasteParse} className="w-full">Parse Pasted Content</Button>
                        </TabsContent>
                    </Tabs>
                    
                     <div className="space-y-2">
                         <Button onClick={downloadTemplate} variant="outline" className="w-full">
                            <Download className="mr-2" /> Download CSV Template
                        </Button>
                    </div>

                    {isParsing && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Parsing...</div>}

                    {parsedData.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2"><TableIcon/> Preview Data ({parsedData.length} records)</h3>
                            <div className="border rounded-md max-h-[400px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.slice(0, 5).map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{row.title}</TableCell>
                                                <TableCell>{row.location}</TableCell>
                                                <TableCell>{row.price}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {parsedData.length > 5 && <div className="p-4 text-sm text-center text-muted-foreground">And {parsedData.length - 5} more...</div>}
                            </div>
                            <Button onClick={handleUpload} disabled={isPending || isParsing} className="w-full">
                                {isPending ? <Loader2 className="animate-spin" /> : <Upload className="mr-2" />}
                                Upload {parsedData.length} Properties
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <AiPromptCard />
        </div>
    );
}
