# Property Listing Content Generation Prompt

You are an expert real estate copywriter and data entry specialist. Your task is to generate detailed and appealing content for a property listing based on the provided information. Fill in the blanks for all the fields below, paying close attention to the required format for each.

**Instructions:**
1.  Copy the entire content of this file.
2.  Fill in the known details for your property in the "## Property Known Details" section. You can provide as much or as little information as you have.
3.  The AI will use your details to generate content for all the fields in the "## Generated Listing Content (JSON)" section.
4.  The output MUST be a single, valid JSON object that can be parsed directly.

---

### **Provide Your Property Details Here:**

*   **Project/Property Name:** (e.g., "Concorde Mayfair")
*   **Location:** (e.g., "Yelahanka, Bangalore")
*   **Property Type:** (e.g., "Apartment", "House", "Villa", "Plot")
*   **Key Features & Highlights:** (Provide a list of key selling points, e.g., "Luxury fittings", "Close to tech parks", "Vastu compliant", "Great city views", "Italian marble flooring", "Smart home features")
*   **Basic Configuration:** (e.g., "2 and 3 BHK apartments", "Starting price $1.2M", "217 units total")
*   **Any other notes or raw data:** (Paste any other relevant information, like a brochure copy or raw notes)

---

### **AI: Generate the JSON content below based on the details provided above.**

You must generate a complete, valid JSON object. For `descriptionHtml` and `specifications`, create rich, well-formatted HTML content. Use headings (`<h4>`), paragraphs (`<p>`), and unordered lists (`<ul><li>...</li></ul>`).

```json
{
  "title": "Concorde Mayfair",
  "price": 20400000,
  "location": "Yelahanka, Bangalore",
  "address": "Yelahanka, Bellary Road, Airport Road, Bangalore",
  "type": "Apartment",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 1459,
  "images": "https://placehold.co/800x600, https://placehold.co/800x600, https://placehold.co/800x600",
  "descriptionHtml": "<h4>A New Benchmark in Luxury Living</h4><p>Concorde Mayfair is a brand new residential Apartment project launched in the vibrant neighborhood of Yelahanka, Bangalore. This residential enclave features the very best in Concorde Group’s luxury living segment, offering spacious 2 & 3 BHK Apartments with world-class features.</p><p>Surrounded by beautiful landscapes and ample open spaces, Concorde Mayfair provides a tranquil and elite living experience. The builder is guaranteed to bring a quality lifestyle to the community with brilliant architecture and an equivalent lifestyle.</p>",
  "amenities": "Fully Equipped Clubhouse, Landscaped Gardens, Gymnasium, Swimming Pool, Indoor Games Area, Outdoor Sports Courts, Children’s Play Area, Party Area, Health Center, Yoga & Activity Area, Jogging Track, Retail Spaces, 24/7 Security with CCTV",
  "lat": 13.1008,
  "lng": 77.5963,
  "landArea": "3.17 Acres",
  "totalUnits": 217,
  "towersAndBlocks": "4 Blocks, 2B + G + 14 Floors",
  "possessionTime": "2028 Onwards",
  "specifications": "<h4>Structure</h4><ul><li>RCC framed structure with Concrete Solid Block Masonry.</li></ul><h4>Flooring</h4><ul><li>Premium Vitrified Flooring in Living and Dining areas.</li><li>Anti-Skid Ceramic Tile flooring in bathrooms and wet areas.</li></ul><h4>Doors</h4><ul><li>Main door with engineered frame and veneer finished shutter.</li><li>Bathroom doors with veneer finish outside and laminate inside.</li></ul><h4>Plumbing & Sanitary</h4><ul><li>Premium CP fittings from brands like Roca/Jaguar.</li><li>High-quality sanitary fixtures from brands like Toto/Hindware.</li><li>Rainwater Harvesting system integrated.</li></ul><h4>Security</h4><ul><li>24/7 security with intercom facility.</li><li>CCTV surveillance at all key vantage points.</li></ul><h4>Electrical</h4><ul><li>Grid power from BESCOM with premium modular switches.</li><li>100% DG backup for common areas, lifts, and pumps.</li></ul>"
}
```
