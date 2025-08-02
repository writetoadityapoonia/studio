
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Mail, Phone, User } from 'lucide-react';
import { format } from 'date-fns';
import { getAllEnquiriesWithPropertyInfo } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function EnquiriesSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-[120px] ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}


export default function EnquiriesPage() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllEnquiriesWithPropertyInfo()
            .then(data => {
                setEnquiries(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                // Handle error
            });
    }, []);


    return (
        <Card>
            <CardHeader>
                <CardTitle>All Enquiries</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? <EnquiriesSkeleton /> : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Property</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enquiries.map((enquiry) => (
                                <TableRow key={enquiry.id}>
                                    <TableCell>{format(new Date(enquiry.createdAt), 'PPp')}</TableCell>
                                    <TableCell className="font-medium">{enquiry.property?.title || 'N/A'}</TableCell>
                                     <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground"/>
                                            {enquiry.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground"/>
                                            {enquiry.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                         <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground"/>
                                            {enquiry.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {enquiry.property && (
                                            <Link href={`/properties/${enquiry.property.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Property
                                                </Button>
                                            </Link>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {enquiries.length === 0 && !loading && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No enquiries found.</p>
                        </div>
                    )}
                </>
                )}
            </CardContent>
        </Card>
    );
}
