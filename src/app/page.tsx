import { getProperties, getUniquePropertyTypes, getPriceRange } from '@/lib/data';
import PropertiesView from '@/components/property/properties-view';

export default async function Home() {
  const initialProperties = await getProperties();
  const propertyTypes = await getUniquePropertyTypes();
  const priceRange = await getPriceRange();

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertiesView 
        initialProperties={initialProperties} 
        propertyTypes={propertyTypes}
        priceRange={priceRange}
      />
    </div>
  );
}
