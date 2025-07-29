import { getProperties } from '@/lib/data';
import PropertiesView from '@/components/property/properties-view';

export default async function Home() {
  const initialProperties = await getProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertiesView initialProperties={initialProperties} />
    </div>
  );
}
