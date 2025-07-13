import express from 'express';

const router = express.Router();

// Types for ConvertKit API responses
interface ConvertKitSubscriber {
  id: number;
  first_name?: string;
  email_address: string;
  state: string;
  created_at: string;
  fields: { [key: string]: string | number | boolean };
}

interface ConvertKitCustomField {
  id: number;
  name: string;
  key: string;
  label: string;
}

// Test ConvertKit API connection
router.post('/test-connection', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.CONVERTKIT_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'ConvertKit API key not configured'
      });
    }

    // Test the connection by fetching account info
    // Kit v4 API uses X-Kit-Api-Key header authentication
    console.log('Testing ConvertKit connection with API key:', apiKey.substring(0, 10) + '...');
    
    // Kit v4 API uses X-Kit-Api-Key header and api.kit.com domain
    const testUrl = 'https://api.kit.com/v4/account';
    console.log('Testing URL:', testUrl);
    
    const response = await fetch(testUrl, {
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

    const data = await response.json() as { custom_fields?: ConvertKitCustomField[] };
    
    res.json({
      success: true,
      message: 'ConvertKit connection successful',
      data: {
        customFieldsCount: data.custom_fields?.length || 0,
        apiKeyValid: true
      }
    });
  } catch (error) {
    console.error('ConvertKit connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to ConvertKit',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get ConvertKit custom fields
router.post('/custom-fields', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.CONVERTKIT_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'ConvertKit API key not configured'
      });
    }

    // Kit v4 API uses X-Kit-Api-Key header and api.kit.com domain
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
    
    res.json({
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
});

// Update subscriber with survey responses
router.post('/update-subscriber', async (req, res) => {
  try {
    const apiKey = process.env.CONVERTKIT_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'ConvertKit API key not configured'
      });
    }

    const { email, fields } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Fields object is required'
      });
    }

    // Step 1: Find the subscriber by email
    const searchUrl = `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'BlueFox/1.0'
      }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Failed to search for subscriber: ${searchResponse.status} ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json() as { subscribers?: ConvertKitSubscriber[] };
    
    if (!searchData.subscribers || searchData.subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscriber not found',
        message: `No subscriber found with email: ${email}`
      });
    }

    const subscriber = searchData.subscribers[0];

    // Step 2: Update the subscriber's custom fields
    // v4 API uses a different endpoint structure for updating custom fields
    const updateUrl = `https://api.kit.com/v4/subscribers`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'BlueFox/1.0'
      },
      body: JSON.stringify({
        email_address: email,
        custom_fields: fields  // Note: 'custom_fields' not 'fields'
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update subscriber: ${updateResponse.status} ${updateResponse.statusText}. Response: ${errorText}`);
    }

    const updateData = await updateResponse.json() as { subscriber?: ConvertKitSubscriber };

    res.json({
      success: true,
      message: 'Subscriber updated successfully',
      data: {
        subscriberId: subscriber.id,
        email: subscriber.email_address,
        updatedFields: fields,
        subscriber: updateData.subscriber
      }
    });

  } catch (error) {
    console.error('Failed to update subscriber:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscriber',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as convertKitRouter };