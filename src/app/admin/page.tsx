'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getProperties } from '@/lib/data';
import type { Property } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteProperty } from '@/lib/actions';

function DeleteConfirmation({ propertyId, onDeleted }: { propertyId: string, onDeleted: () => void }) {
    const { toast } = useToast();

    const handleDelete = async () => {
        try {
            await deleteProperty(propertyId);
            toast({ title: 'Property Deleted', description: 'The property has been successfully deleted.' });
            onDeleted();
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

export default function AdminDashboard() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchProperties = () => {
        setLoading(true);
        getProperties()
            .then(data => {
                setProperties(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                // Handle error case, maybe show a toast
            });
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    if (loading) {
        return <div className="container mx-auto py-10">Loading...</div>
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Manage Properties</CardTitle>
                    <Link href="/admin/properties/new">
                        <Button>
                            <PlusCircle className="mr-2" />
                            Create New Property
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {properties.map((property) => (
                                <TableRow key={property.id}>
                                    <TableCell className="font-medium">{property.title}</TableCell>
                                    <TableCell>{property.location}</TableCell>
                                    <TableCell>${property.price.toLocaleString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/admin/properties/${property.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <DeleteConfirmation propertyId={property.id} onDeleted={fetchProperties} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
