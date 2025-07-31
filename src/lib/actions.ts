'use server';

import { revalidatePath } from 'next/cache';

// This file contains server actions that can be called from client components.

/**
 * A server action to save the generated page content.
 * For now, it just logs the content to the console.
 * In a real application, this would save the content to a database.
 * @param htmlContent The HTML content of the page to save.
 */
export async function savePageContent(htmlContent: string) {
  console.log('--- SAVED PAGE CONTENT ---');
  console.log(htmlContent);
  // In a real app, you would save this `htmlContent` to your database,
  // associating it with a specific property ID.
  // For example: await db.properties.update({ where: { id: propertyId }, data: { description: htmlContent } });
  
  // Revalidate the properties page to reflect changes if any were made.
  revalidatePath('/properties');
}
