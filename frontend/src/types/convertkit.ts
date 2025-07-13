// ConvertKit API types based on v4 API documentation

// ConvertKit subscriber response
export interface ConvertKitSubscriber {
  id: number;
  first_name?: string;
  email_address: string;
  state: 'active' | 'inactive' | 'cancelled' | 'bounced' | 'complained';
  created_at: string;
  fields: { [key: string]: string | number | boolean };
}

// ConvertKit custom field definition
export interface ConvertKitCustomField {
  id: number;
  name: string;
  key: string;
  label: string;
}

// ConvertKit API responses
export interface ConvertKitSubscriberResponse {
  subscriber: ConvertKitSubscriber;
}

export interface ConvertKitSubscribersResponse {
  subscribers: ConvertKitSubscriber[];
  page: number;
  total_subscribers: number;
}

export interface ConvertKitCustomFieldsResponse {
  custom_fields: ConvertKitCustomField[];
}

// API request types
export interface UpdateSubscriberRequest {
  email: string;
  fields: { [key: string]: string | number | boolean };
}

export interface UpdateSubscriberFields {
  fields: { [key: string]: string | number | boolean };
}

// ConvertKit integration settings
export interface ConvertKitSettings {
  apiKey: string;
  isConnected: boolean;
  customFields: ConvertKitCustomField[];
  lastSyncAt?: Date;
}

// Field mapping for survey questions to ConvertKit fields
export interface FieldMapping {
  questionId: string;
  convertKitFieldKey: string;
  convertKitFieldName: string;
  transformationType?: 'direct' | 'boolean_to_text' | 'scale_to_number' | 'option_mapping';
  optionMappings?: { [optionId: string]: string }; // For multiple choice questions
}