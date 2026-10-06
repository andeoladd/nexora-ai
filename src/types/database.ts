export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  website: string;
  description: string;
  industry: string;
  target_market: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price?: string;
  target_customer?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsiteAnalysis {
  id: string;
  user_id: string;
  business_id?: string;
  url: string;
  business_summary: string;
  products_services: string[];
  target_audience: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  recommended_services: string[];
  confidence_score: number; // 0-100
  is_demo?: boolean;
  created_at: string;
}

export interface IdealCustomerProfile {
  id: string;
  user_id: string;
  business_id?: string;
  industry: string;
  company_size: string;
  location: string;
  buyer_role: string;
  budget: string;
  pain_points: string[];
  buying_signals: string[];
  interests?: string[];
  target_markets: string[];
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'discovered' | 'researched' | 'contacted' | 'replied' | 'qualified' | 'won' | 'lost' | 'not_interested';

export interface Lead {
  id: string;
  user_id: string;
  company_name: string;
  website: string;
  contact_name: string;
  contact_email: string;
  industry: string;
  country: string;
  city: string;
  company_size: string;
  business_model: string;
  description: string;
  source: string;
  status: LeadStatus;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadResearch {
  id: string;
  user_id: string;
  lead_id: string;
  website_observations: string[];
  products_services: string[];
  target_audience: string;
  strengths: string[];
  weaknesses: string[];
  pain_points: string[];
  growth_opportunities: string[];
  buying_signals: string[];
  research_summary: string;
  evidence: string[];
  confidence_score: number; // 0 - 100
  created_at: string;
}

export interface LeadNeed {
  id: string;
  user_id: string;
  lead_id: string;
  need: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  confidence_score: number;
  created_at: string;
}

export interface LeadScore {
  id: string;
  user_id: string;
  lead_id: string;
  lead_quality: number; // 0-100
  need_strength: number; // 0-100
  service_match: number; // 0-100
  opportunity_score: number; // 0-100
  confidence_score: number; // 0-100
  reasoning: string;
  created_at: string;
}

export interface LeadServiceMatch {
  id: string;
  user_id: string;
  lead_id: string;
  service_id?: string;
  service_name: string;
  match_score: number; // 0-100
  reasoning: string;
  evidence: string;
  created_at: string;
}

export interface LeadList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadListMember {
  id: string;
  user_id: string;
  lead_list_id: string;
  lead_id: string;
  created_at: string;
}

export type CampaignChannel = 'email' | 'linkedin' | 'instagram' | 'whatsapp' | 'general_dm';
export type CampaignStatus = 'draft' | 'ready' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  target_service: string;
  lead_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignLead {
  id: string;
  user_id: string;
  campaign_id: string;
  lead_id: string;
  status: 'pending' | 'drafted' | 'approved' | 'sent' | 'replied';
  custom_message?: string;
  created_at: string;
  updated_at: string;
}

export type ProspectIntent =
  | 'interested'
  | 'curious'
  | 'question'
  | 'pricing_request'
  | 'objection'
  | 'not_interested'
  | 'needs_more_information'
  | 'meeting_request'
  | 'positive_response'
  | 'negative_response'
  | 'unclear';

export type ConversationStage =
  | 'new'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'qualified'
  | 'meeting_requested'
  | 'meeting_booked'
  | 'proposal'
  | 'won'
  | 'lost'
  | 'not_interested';

export interface Conversation {
  id: string;
  user_id: string;
  lead_id: string;
  campaign_id?: string;
  stage: ConversationStage;
  recommended_service: string;
  prospect_need: string;
  important_context: string;
  next_action: string;
  sentiment: 'positive' | 'neutral' | 'skeptical' | 'negative';
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  sender_type: 'user' | 'prospect' | 'system';
  message: string;
  channel: CampaignChannel;
  created_at: string;
}

export interface OutreachDraft {
  id: string;
  user_id: string;
  lead_id: string;
  campaign_id?: string;
  channel: CampaignChannel;
  subject?: string;
  message: string;
  status: 'draft' | 'approved' | 'sent';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'lead' | 'conversation' | 'campaign' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  feature: string;
  usage_count: number;
  period: string; // e.g., '2026-10'
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'starter' | 'growth' | 'scale';
  status: 'active' | 'trialing' | 'cancelled';
  renewal_date: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  default_channel: CampaignChannel;
  notification_preferences: {
    email_alerts: boolean;
    conversation_alerts: boolean;
    lead_alerts: boolean;
    campaign_alerts: boolean;
  };
  AI_preferences: {
    tone: 'consultative' | 'direct' | 'conversational' | 'formal';
    preferred_outreach_style: 'problem_focused' | 'value_first' | 'quick_observation';
    auto_suggest_replies: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  category: 'Account' | 'Billing' | 'Leads' | 'AI Assistant' | 'Conversations' | 'Technical Problem' | 'Other';
  message: string;
  attachment_name?: string;
  status: 'received' | 'investigating' | 'resolved';
  created_at: string;
}
