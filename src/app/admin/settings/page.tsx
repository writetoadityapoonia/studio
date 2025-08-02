
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPropertyType, deletePropertyType } from '@/lib/actions';
import { getPropertyTypes } from '@/lib/data';
import type { PropertyType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const typeSchema = z.object({
  name: z.string().min(2, 'Type name must be at least 2 characters.'),
});

type TypeFormValues = z.infer<typeof typeSchema>;

export default function SettingsPage() {
    const [types, setTypes] = useState<PropertyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<TypeFormValues>({
        resolver: zodResolver(typeSchema),
        defaultValues: { name: '' },
    });
    
    const fetchTypes = () => {
        setLoading(true);
        getPropertyTypes().then(data => {
            setTypes(data);
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchTypes();
    }, []);

    const onSubmit = async (data: TypeFormValues) => {
        startTransition(async () => {
            try {
                await createPropertyType(data);
                toast({ title: 'Type Created', description: `The type "${data.name}" has been added.` });
                fetchTypes(); // Refetch to update the list
                form.reset();
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to create property type.', variant: 'destructive' });
            }
        });
    };
    
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the type "${name}"? This cannot be undone.`)) return;
        
        startTransition(async () => {
            try {
                await deletePropertyType(id);
                toast({ title: 'Type Deleted', description: `The type "${name}" has been removed.` });
                fetchTypes();
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to delete property type.', variant: 'destructive' });
            }
        });
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Property Types</CardTitle>
                    <CardDescription>Add or remove property types that can be assigned to listings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <Label htmlFor="name">New Type Name</Label>
                                        <FormControl>
                                            <Input id="name" placeholder="e.g., Villa, Plot" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                                <span className="ml-2">Add Type</span>
                            </Button>
                        </form>
                    </Form>
                    
                    <div className="space-y-2">
                        <h4 className="font-medium">Existing Types</h4>
                        {loading ? (
                            <p>Loading types...</p>
                        ) : types.length > 0 ? (
                           <ul className="space-y-2">
                               {types.map(type => (
                                   <li key={type.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                       <span>{type.name}</span>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id, type.name)} disabled={isPending}>
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                        </Button>
                                   </li>
                               ))}
                           </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No property types found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Other application settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Future home of other general settings.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    