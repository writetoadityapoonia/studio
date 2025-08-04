
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

const CSV_TEMPLATE_HEADERS = ['title', 'address', 'locality', 'lat', 'lng', 'bhk', 'price', 'propertyType', 'builtUpArea', 'furnishing', 'projectName', 'description', 'images', 'floor', 'age', 'facing', 'amenities', 'ownerContact'];
const CSV_TEMPLATE_DATA = [
    ['Elegant 3BHK Apartment', '123 Main St, Koramangala, Bengaluru, Karnataka 560034, India', 'Koramangala', 12.9357, 77.6245, '3BHK', 15000000, 'Apartment', 1600, 'Semi-Furnished', 'Prestige Pinewood', '[{"id":"a1b2c3d4","type":"Text","text":"A beautiful apartment."}]', 'https://placehold.co/800x600.png,https://placehold.co/800x600.png', 5, '1-3 Years', 'East', 'Swimming Pool,Gymnasium', '9876543210'],
    ['Luxury Villa with Pool', '456 Whitefield Rd, Whitefield, Bengaluru, Karnataka 560066, India', 'Whitefield', 12.9698, 77.7500, '4BHK', 50000000, 'Villa', 3500, 'Fully-Furnished', 'Sobha Windsor', '[]', 'https://placehold.co/800x600.png', 2, '0-1 Years', 'North', 'Swimming Pool,Clubhouse,24x7 Security', '9876543211']
];

const AI_PROMPT = `You are an expert real estate data entry specialist and content migrator. Your task is to convert unstructured text or HTML describing multiple properties into a structured CSV format.

**Your Goal:** Convert the provided text into a single, valid CSV string. The first line of the CSV must be the header row, and all subsequent rows will be the property data.

**CSV Headers (must be in this order):**
\`title,address,locality,lat,lng,bhk,price,propertyType,builtUpArea,furnishing,projectName,description,images,floor,age,facing,amenities,ownerContact\`

**Column Instructions:**

1.  **title**: The main title of the property listing.
2.  **address**: The full address of the property.
3.  **locality**: The neighborhood or locality.
4.  **lat**: Latitude coordinate.
5.  **lng**: Longitude coordinate.
6.  **bhk**: Configuration like '2BHK', '3BHK'.
7.  **price**: Price in numbers, no commas or currency symbols (e.g., \`15000000\`).
8.  **propertyType**: 'Apartment', 'Villa', 'Plot', etc.
9.  **builtUpArea**: Area in square feet, numbers only.
10. **furnishing**: 'Unfurnished', 'Semi-Furnished', or 'Fully-Furnished'.
11. **projectName**: The name of the building or project.
12. **description (Important!)**: This must be a JSON array representing the property's detailed description. If the source text contains HTML or rich formatting, you must convert it to the specified JSON format. For no description, use an empty array: \`[]\`.
13. **images**: A comma-separated list of image URLs. For placeholders, use \`https://placehold.co/800x600.png\`.
14. **floor**: The floor number of the property.
15. **age**: Age of the property (e.g., 'New', '1-3 Years').
16. **facing**: Direction the property faces (e.g., 'North', 'East').
17. **amenities**: A comma-separated list of amenities (e.g., 'Swimming Pool,Gymnasium').
18. **ownerContact**: The owner's phone number.


**Description JSON Schema:**
*   **Text**: \`{ "id": "uuid", "type": "Text", "text": "...", "size": "sm|md|lg|xl", "align": "left|center|right", "color": "default|primary|muted", "style": ["bold", "italic"] }\`
*   **Table**: \`{ "id": "uuid", "type": "Table", "headers": ["Header1"], "rows": [["r1c1"]] }\`
*   **Image**: \`{ "id": "uuid", "type": "Image", "src": "url", "alt": "description" }\`
*   **Spacer**: \`{ "id": "uuid", "type": "Spacer", "size": "sm|md|lg" }\`
*   **Divider**: \`{ "id": "uuid", "type": "Divider" }\`
*   Generate a unique UUID for each component's "id" field.

**Return CSV only**: Your entire output must be a single, valid CSV formatted string.
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
                    title: row.title || '',
                    location: {
                        address: row.address || '',
                        locality: row.locality || '',
                        lat: parseFloat(row.lat) || 0,
                        lng: parseFloat(row.lng) || 0,
                    },
                    bhk: row.bhk || '',
                    price: parseFloat(row.price) || 0,
                    propertyType: row.propertyType || '',
                    builtUpArea: parseFloat(row.builtUpArea) || 0,
                    furnishing: row.furnishing || '',
                    projectName: row.projectName || '',
                    description: row.description || '[]',
                    images: row.images ? row.images.split(',').map(url => url.trim()) : [],
                    floor: parseInt(row.floor, 10) || 0,
                    age: row.age || '',
                    facing: row.facing || '',
                    amenities: row.amenities ? row.amenities.split(',').map(a => a.trim()) : [],
                    ownerContact: row.ownerContact || '',
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
                    // Quote all fields, especially those with commas
                    return `"${(cell.toString() || '').replace(/"/g, '""')}"`;
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
                                placeholder={CSV_TEMPLATE_HEADERS.join(',')}
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
                                                <TableCell>{row.location.address}</TableCell>
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
