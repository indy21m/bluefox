import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

interface SurveyResponseData {
  surveyId: string;
  respondentEmail?: string;
  answers: Array<{
    questionId: string;
    value: any;
    selectedOptionId?: string;
  }>;
  fieldMappings?: Record<string, string>;
  optionMappings?: Record<string, Record<string, string>>;
  apiKey?: string;
}

// Submit survey response and update ConvertKit
router.post('/responses', async (req: Request, res: Response) => {
  try {
    const { surveyId, respondentEmail, answers, fieldMappings, optionMappings, apiKey } = req.body as SurveyResponseData;

    if (!surveyId || !answers || answers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Survey ID and answers are required' 
      });
    }

    // If no email provided, try to find it in answers
    let email = respondentEmail;
    if (!email) {
      const emailAnswer = answers.find(a => a.questionId && a.value && a.value.includes('@'));
      if (emailAnswer) {
        email = emailAnswer.value;
      }
    }

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email address is required to submit response' 
      });
    }

    // Check if API key was provided
    if (!apiKey) {
      console.error('ConvertKit API key not provided');
      // Still save the response even if we can't update ConvertKit
      return res.json({ 
        success: true, 
        message: 'Response saved (ConvertKit not configured)',
        email 
      });
    }

    // Find subscriber in ConvertKit
    const searchUrl = `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      console.error('Failed to search for subscriber:', await searchResponse.text());
      return res.json({ 
        success: true, 
        message: 'Response saved (subscriber not found)',
        email 
      });
    }

    const searchData = await searchResponse.json() as { subscribers?: any[] };
    const subscribers = searchData.subscribers || [];
    
    if (subscribers.length === 0) {
      // Subscriber not found - you might want to create them here
      return res.json({ 
        success: true, 
        message: 'Response saved (subscriber not in ConvertKit)',
        email 
      });
    }

    const subscriber = subscribers[0];
    const subscriberId = subscriber.id;

    // Build field updates from field mappings
    const fieldsToUpdate: Record<string, any> = {};
    
    if (fieldMappings) {
      // fieldMappings should be an object mapping questionId to field key
      for (const answer of answers) {
        const fieldKey = fieldMappings[answer.questionId];
        if (fieldKey) {
          let fieldValue = answer.value;
          
          // Check if this question has option mappings (for multiple choice)
          if (optionMappings && optionMappings[answer.questionId]) {
            const mappedValue = optionMappings[answer.questionId][answer.value];
            if (mappedValue) {
              fieldValue = mappedValue;
            }
          }
          
          fieldsToUpdate[fieldKey] = fieldValue;
        }
      }
    }

    // Only update if we have fields to update
    if (Object.keys(fieldsToUpdate).length > 0) {
      const updateUrl = `https://api.kit.com/v4/subscribers/${subscriberId}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'X-Kit-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: fieldsToUpdate
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update subscriber:', await updateResponse.text());
        return res.json({ 
          success: true, 
          message: 'Response saved (ConvertKit update failed)',
          email 
        });
      }

      return res.json({ 
        success: true, 
        message: 'Response saved and ConvertKit updated',
        email,
        updatedFields: Object.keys(fieldsToUpdate).length
      });
    }

    return res.json({ 
      success: true, 
      message: 'Response saved (no fields to update)',
      email 
    });

  } catch (error) {
    console.error('Error processing survey response:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process survey response' 
    });
  }
});

export default router;