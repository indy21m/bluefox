import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ConvertKitCustomField {
  id: number;
  name: string;
  key: string;
  label: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = req.body.apiKey || process.env.CONVERTKIT_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'ConvertKit API key not configured'
      });
    }

    console.log('Fetching custom fields from Kit API...');
    
    let allCustomFields: ConvertKitCustomField[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;
    
    // Fetch all pages of custom fields
    while (hasNextPage) {
      const url = new URL('https://api.kit.com/v4/custom_fields');
      url.searchParams.append('per_page', '500'); // Max per page
      if (cursor) {
        url.searchParams.append('after', cursor);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'X-Kit-Api-Key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'BlueFox/1.0'
        }
      });
      
      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorBody = await response.text();
          errorDetails = ` - ${errorBody}`;
        } catch (e) {
          // Ignore if we can't read the error body
        }
        throw new Error(`ConvertKit API error: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const data = await response.json() as any;
      console.log(`Fetched page with ${data.custom_fields?.length || 0} custom fields`);
      
      if (data.custom_fields && Array.isArray(data.custom_fields)) {
        allCustomFields = [...allCustomFields, ...data.custom_fields];
      }
      
      // Check if there are more pages
      hasNextPage = data.pagination?.has_next_page || false;
      cursor = data.pagination?.end_cursor || null;
    }
    
    console.log(`Total custom fields fetched: ${allCustomFields.length}`);
    
    res.status(200).json({
      success: true,
      custom_fields: allCustomFields
    });
  } catch (error) {
    console.error('Failed to fetch custom fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch custom fields',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}