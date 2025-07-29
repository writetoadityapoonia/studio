import { getPropertyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PropertyForm } from '@/components/admin/property-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type EditPropertyPageProps = {
  params: {
    id: string;
  };
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Edit Property: {property.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyForm property={property} />
        </CardContent>
      </Card>
    </div>
  );
}
