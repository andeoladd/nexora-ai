export const SUPPORT_CONFIG = {
  email: import.meta.env.VITE_SUPPORT_EMAIL || 'support@nexora.ai',
  productName: 'Nexora',
  categories: [
    'Account',
    'Billing',
    'Leads',
    'AI Assistant',
    'Conversations',
    'Technical Problem',
    'Other',
  ] as const,
  responseTimeHint: 'Typically responds within 2-4 business hours',
};

export type SupportCategory = typeof SUPPORT_CONFIG.categories[number];
