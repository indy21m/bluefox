import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ConvertKitSubscriber {
  id: number;
  first_name?: string;
  email_address: string;
  state: string;
  created_at: string;
  fields: { [key: string]: string | number | boolean };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    res.status(200).json({
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
}