
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getProperties } from '@/lib/data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteProperty, bulkDeleteProperties } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

function DeleteConfirmation({ propertyId, onDeleted }) {
    const { toast } = useToast();

    const handleDelete = async () => {
        try {
            await deleteProperty(propertyId);
            toast({ title: 'Property Deleted', description: 'The property has been successfully deleted.' });
            if (onDeleted) onDeleted();
        } catch (error) {
            toast({
                title: 'Error Deleting Property',
                description: 'There was an error deleting the property.',
                variant: 'destructive',
            });
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the property
                        and remove its data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function PropertiesSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]"><Checkbox disabled /></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Checkbox disabled /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell className="text-right space-x-2">
                             <Skeleton className="h-8 w-[75px] inline-block" />
                             <Skeleton className="h-8 w-[95px] inline-block" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function AdminDashboard() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperties, setSelectedProperties] = useState([]);
    const { toast } = useToast();
    
    const fetchProperties = () => {
        setLoading(true);
        getProperties()
            .then(data => {
                setProperties(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast({ title: "Error", description: "Could not fetch properties."})
            });
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedProperties(properties.map(p => p.id));
        } else {
            setSelectedProperties([]);
        }
    }

    const handleSelectSingle = (id, checked) => {
        if (checked) {
            setSelectedProperties(prev => [...prev, id]);
        } else {
            setSelectedProperties(prev => prev.filter(propId => propId !== id));
        }
    }
    
    const handleBulkDelete = async () => {
        try {
            await bulkDeleteProperties(selectedProperties);
            toast({ title: 'Properties Deleted', description: `${selectedProperties.length} properties have been successfully deleted.` });
            setSelectedProperties([]);
            fetchProperties(); // Refetch to update the list
        } catch (error) {
             toast({
                title: 'Error Deleting Properties',
                description: 'There was an error deleting the selected properties.',
                variant: 'destructive',
            });
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Properties</CardTitle>
                <div className="flex items-center gap-2">
                    {selectedProperties.length > 0 && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete ({selectedProperties.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete {selectedProperties.length} properties.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Link href="/admin/properties/new">
                        <Button>
                            <PlusCircle className="mr-2" />
                            Create New Property
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? <PropertiesSkeleton /> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox 
                                        checked={selectedProperties.length === properties.length && properties.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {properties.map((property) => (
                                <TableRow key={property.id} data-state={selectedProperties.includes(property.id) && "selected"}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selectedProperties.includes(property.id)}
                                            onCheckedChange={(checked) => handleSelectSingle(property.id, checked)}
                                            aria-label={`Select property ${property.title}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{property.title}</TableCell>
                                    <TableCell>{property.location.address}</TableCell>
                                    <TableCell>{formatCurrency(property.price, 'INR')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/admin/properties/${property.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <DeleteConfirmation propertyId={property.id} onDeleted={() => {
                                            fetchProperties();
                                            setSelectedProperties(prev => prev.filter(id => id !== property.id));
                                        }} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
