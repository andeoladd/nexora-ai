-- ==============================================================================
-- NEXORA - PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant SaaS Architecture for Nexora AI Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_profiles_user_id UNIQUE (user_id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 2. BUSINESSES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    industry TEXT,
    target_market TEXT,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own businesses" ON public.businesses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own businesses" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own businesses" ON public.businesses
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own businesses" ON public.businesses
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. SERVICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT,
    target_customer TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own services" ON public.services
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own services" ON public.services
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own services" ON public.services
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own services" ON public.services
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. WEBSITE ANALYSES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    business_summary TEXT NOT NULL,
    products_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_audience TEXT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score INTEGER NOT NULL DEFAULT 85,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.website_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own website analyses" ON public.website_analyses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own website analyses" ON public.website_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own website analyses" ON public.website_analyses
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own website analyses" ON public.website_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. IDEAL CUSTOMER PROFILES (ICP)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ideal_customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    industry TEXT NOT NULL,
    company_size TEXT,
    location TEXT,
    buyer_role TEXT,
    budget TEXT,
    pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    buying_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    interests JSONB DEFAULT '[]'::jsonb,
    target_markets JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.ideal_customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ICPs" ON public.ideal_customer_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ICPs" ON public.ideal_customer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ICPs" ON public.ideal_customer_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ICPs" ON public.ideal_customer_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. LEADS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    contact_name TEXT,
    contact_email TEXT,
    industry TEXT,
    country TEXT,
    city TEXT,
    company_size TEXT,
    business_model TEXT,
    description TEXT,
    source TEXT DEFAULT 'Nexora Discovery',
    status TEXT NOT NULL DEFAULT 'discovered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- ------------------------------------------------------------------------------
-- 7. LEAD RESEARCH
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    website_observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    products_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_audience TEXT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    growth_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
    buying_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    research_summary TEXT NOT NULL,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score INTEGER NOT NULL DEFAULT 85,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_lead_research_lead_id UNIQUE (lead_id)
);
ALTER TABLE public.lead_research ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead research" ON public.lead_research
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lead research" ON public.lead_research
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lead research" ON public.lead_research
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lead research" ON public.lead_research
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. LEAD NEEDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    need TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    evidence TEXT NOT NULL,
    confidence_score INTEGER NOT NULL DEFAULT 85,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.lead_needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead needs" ON public.lead_needs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lead needs" ON public.lead_needs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lead needs" ON public.lead_needs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lead needs" ON public.lead_needs
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. LEAD SCORES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    lead_quality INTEGER NOT NULL DEFAULT 80,
    need_strength INTEGER NOT NULL DEFAULT 80,
    service_match INTEGER NOT NULL DEFAULT 80,
    opportunity_score INTEGER NOT NULL DEFAULT 80,
    confidence_score INTEGER NOT NULL DEFAULT 85,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_lead_scores_lead_id UNIQUE (lead_id)
);
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead scores" ON public.lead_scores
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lead scores" ON public.lead_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lead scores" ON public.lead_scores
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lead scores" ON public.lead_scores
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. LEAD SERVICE MATCHES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_service_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    match_score INTEGER NOT NULL DEFAULT 85,
    reasoning TEXT NOT NULL,
    evidence TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.lead_service_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service matches" ON public.lead_service_matches
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own service matches" ON public.lead_service_matches
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own service matches" ON public.lead_service_matches
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own service matches" ON public.lead_service_matches
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 11. LEAD LISTS & MEMBERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lead lists" ON public.lead_lists
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lead_list_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_list_id UUID NOT NULL REFERENCES public.lead_lists(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_list_member UNIQUE (lead_list_id, lead_id)
);
ALTER TABLE public.lead_list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own list members" ON public.lead_list_members
    FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 12. CAMPAIGNS & CAMPAIGN LEADS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL DEFAULT 'email',
    status TEXT NOT NULL DEFAULT 'draft',
    target_service TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns" ON public.campaigns
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.campaign_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    custom_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaign leads" ON public.campaign_leads
    FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 13. CONVERSATIONS & MESSAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    stage TEXT NOT NULL DEFAULT 'new',
    recommended_service TEXT NOT NULL,
    prospect_need TEXT NOT NULL,
    important_context TEXT NOT NULL DEFAULT '',
    next_action TEXT NOT NULL DEFAULT '',
    sentiment TEXT NOT NULL DEFAULT 'neutral',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversation messages" ON public.conversation_messages
    FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 14. OUTREACH DRAFTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outreach_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.outreach_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own outreach drafts" ON public.outreach_drafts
    FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 15. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 16. USAGE & SUBSCRIPTIONS & SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    period TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_usage_user_feature_period UNIQUE (user_id, feature, period)
);
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own usage" ON public.usage FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'growth',
    status TEXT NOT NULL DEFAULT 'active',
    renewal_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_subscriptions_user_id UNIQUE (user_id)
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    default_channel TEXT NOT NULL DEFAULT 'email',
    notification_preferences JSONB NOT NULL DEFAULT '{"email_alerts":true,"conversation_alerts":true,"lead_alerts":true,"campaign_alerts":true}'::jsonb,
    ai_preferences JSONB NOT NULL DEFAULT '{"tone":"consultative","preferred_outreach_style":"problem_focused","auto_suggest_replies":true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_settings_user_id UNIQUE (user_id)
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON public.settings FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 17. SUPPORT TICKETS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_name TEXT,
    status TEXT NOT NULL DEFAULT 'received',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert support tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own support tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
