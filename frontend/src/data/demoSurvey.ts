import type { Survey } from '../types';

export const demoSurvey: Survey = {
  id: 'demo',
  title: 'BlueFox Demo Survey',
  description: 'Experience our intelligent survey platform with conditional logic and auto-advance.',
  startQuestionId: 'q1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  completions: 42,
  settings: {
    autoAdvanceDelay: 750,
    showProgressBar: true,
    allowBackNavigation: true,
    requireEmailCapture: false,
    successMessage: 'Thank you! Your responses help us understand our audience better.',
    redirectUrl: undefined
  },
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice',
      title: 'What best describes your role?',
      description: 'This helps us personalize your experience',
      required: true,
      order: 1,
      convertKitField: 'role',
      options: [
        {
          id: 'role_1',
          text: '👨‍💼 Business Owner / Entrepreneur',
          value: 'business_owner',
          convertKitFieldValue: 'Business Owner'
        },
        {
          id: 'role_2',
          text: '📈 Marketing Professional',
          value: 'marketer',
          convertKitFieldValue: 'Marketer'
        },
        {
          id: 'role_3',
          text: '💻 Developer / Technical',
          value: 'developer',
          convertKitFieldValue: 'Developer'
        },
        {
          id: 'role_4',
          text: '🎓 Student / Learning',
          value: 'student',
          convertKitFieldValue: 'Student'
        }
      ],
      conditionalLogic: [
        {
          id: 'logic_1',
          questionId: 'q1',
          condition: 'equals',
          value: 'business_owner',
          nextQuestionId: 'q2_business'
        },
        {
          id: 'logic_2',
          questionId: 'q1',
          condition: 'equals',
          value: 'marketer',
          nextQuestionId: 'q2_marketing'
        }
      ]
    },
    {
      id: 'q2_business',
      type: 'scale',
      title: 'How many team members do you have?',
      description: 'Including yourself',
      required: true,
      order: 2,
      minValue: 1,
      maxValue: 10,
      convertKitField: 'team_size'
    },
    {
      id: 'q2_marketing',
      type: 'multiple_choice',
      title: 'Which marketing channels do you focus on?',
      description: 'Select your primary channel',
      required: true,
      order: 2,
      convertKitField: 'marketing_channel',
      options: [
        {
          id: 'channel_1',
          text: '📧 Email Marketing',
          value: 'email',
          convertKitFieldValue: 'Email'
        },
        {
          id: 'channel_2',
          text: '📱 Social Media',
          value: 'social',
          convertKitFieldValue: 'Social Media'
        },
        {
          id: 'channel_3',
          text: '🔍 SEO / Content',
          value: 'seo',
          convertKitFieldValue: 'SEO'
        },
        {
          id: 'channel_4',
          text: '💰 Paid Advertising',
          value: 'paid',
          convertKitFieldValue: 'Paid Ads'
        }
      ]
    },
    {
      id: 'q3',
      type: 'boolean',
      title: 'Are you currently using ConvertKit?',
      description: 'This helps us understand your email setup',
      required: true,
      order: 3,
      convertKitField: 'uses_convertkit',
      conditionalLogic: [
        {
          id: 'logic_3',
          questionId: 'q3',
          condition: 'equals',
          value: 'true',
          nextQuestionId: 'q4_convertkit_user'
        },
        {
          id: 'logic_4',
          questionId: 'q3',
          condition: 'equals',
          value: 'false',
          nextQuestionId: 'q4_email_provider'
        }
      ]
    },
    {
      id: 'q4_convertkit_user',
      type: 'scale',
      title: 'How satisfied are you with ConvertKit?',
      description: 'Rate from 1 (not satisfied) to 10 (very satisfied)',
      required: true,
      order: 4,
      minValue: 1,
      maxValue: 10,
      convertKitField: 'convertkit_satisfaction'
    },
    {
      id: 'q4_email_provider',
      type: 'text',
      title: 'What email service do you currently use?',
      description: 'e.g., Mailchimp, AWeber, etc.',
      required: false,
      order: 4,
      placeholder: 'Enter your email provider...',
      convertKitField: 'current_email_provider'
    },
    {
      id: 'q5',
      type: 'email',
      title: 'What\'s your email address?',
      description: 'We\'ll send you personalized recommendations based on your answers',
      required: true,
      order: 5,
      placeholder: 'Enter your email address...',
      convertKitField: 'email'
    }
  ]
};