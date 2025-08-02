

'use client';

import { useState, useEffect, Suspense, useTransition } from 'react';
import { PropertyList } from '@/components/property-list';
import { getProperties, getPropertyTypes } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSidebar } from '@/components/filter-sidebar';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';

function PropertyListSkeleton({ view = 'grid' }) {
    const listClass = "flex flex-col gap-4";
    const gridClass = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8";
    
    return (
        <div className={view === 'list' ? listClass : gridClass}>
            {[...Array(6)].map((_, i) => (
                 <Card key={i} className={`flex ${view === 'list' ? 'flex-row' : 'flex-col'} overflow-hidden`}>
                    <Skeleton className={`flex-shrink-0 ${view === 'list' ? 'w-1/3 h-48' : 'w-full h-56'}`} />
                    <div className="p-4 flex flex-col flex-grow w-full">
                        <div className="flex-grow">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-7 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <div className={`grid gap-4 ${view === 'list' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Skeleton className="h-10 w-28" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

function PageClient({ initialProperties, propertyTypes, searchParams }) {
    const [view, setView] = useState('grid');
    const hasSearchResults = searchParams.lat && searchParams.lng;

    return (
        <div className="container mx-auto px-4 py-8">
            <section className="text-center mb-12">
                {hasSearchResults ? (
                    <h1 className="text-5xl font-headline font-bold mb-4">Properties Near Your Search</h1>
                ) : (
                    <>
                        <h1 className="text-5xl font-headline font-bold mb-4">Explore Our Listings</h1>
                        <p className="text-xl text-muted-foreground">
                          Discover the finest properties available.
                        </p>
                    </>
                )}
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <FilterSidebar propertyTypes={propertyTypes} />
                </aside>
                <main className="lg:col-span-3">
                    <div className="flex justify-end mb-4">
                        <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value)}>
                            <ToggleGroupItem value="grid" aria-label="Grid view">
                                <LayoutGrid className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="List view">
                                <List className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    
                    <PropertyList initialProperties={initialProperties} searchParams={searchParams} view={view} />

                    {initialProperties.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground lg:col-span-4">
                            <p>No properties found matching your criteria.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function PropertiesPageWrapper({ searchParams }) {
    const [properties, setProperties] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // This key will change whenever searchParams change, forcing a re-render of PageClient
    const key = JSON.stringify(searchParams);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [props, types] = await Promise.all([
                getProperties({ ...searchParams, limit: 6, page: 1 }),
                getPropertyTypes()
            ]);
            setProperties(props);
            setPropertyTypes(types);
            setLoading(false);
        }
        loadData();
    }, [searchParams]);

    if (loading) {
        return (
             <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
                    <Skeleton className="h-6 w-1/3 mx-auto" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <Skeleton className="h-96 w-full" />
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="flex justify-end mb-4">
                            <Skeleton className="h-10 w-24" />
                         </div>
                         <PropertyListSkeleton />
                    </main>
                </div>
            </div>
        )
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PageClient
                key={key} // Force re-mount on search param change
                initialProperties={properties}
                propertyTypes={propertyTypes}
                searchParams={searchParams}
            />
        </Suspense>
    );
}
