import {
  Profile,
  Business,
  Service,
  WebsiteAnalysis,
  IdealCustomerProfile,
  Lead,
  LeadResearch,
  LeadScore,
  LeadServiceMatch,
  LeadList,
  LeadListMember,
  Campaign,
  CampaignLead,
  Conversation,
  ConversationMessage,
  OutreachDraft,
  Notification,
  Usage,
  Subscription,
  Settings,
  SupportTicket,
} from '../types/database';
import { supabase, isLiveSupabaseConfigured, getTenantTable, saveTenantTable } from '../lib/supabase';

class DatabaseService {
  // --------------------------------------------------------------------------
  // USER INITIALIZATION (Called on registration to set up user's workspace)
  // --------------------------------------------------------------------------
  async initializeUserData(userId: string, name: string, email: string): Promise<void> {
    if (!userId) return;

    // Default profile
    const existingProfile = await this.getProfile(userId);
    if (!existingProfile) {
      await this.upsertProfile(userId, {
        id: `prof_${userId}`,
        user_id: userId,
        display_name: name || 'Nexora User',
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Default Business Profile
    const existingBusiness = await this.getBusiness(userId);
    if (!existingBusiness) {
      await this.upsertBusiness(userId, {
        id: `biz_${userId}`,
        user_id: userId,
        business_name: `${name}'s Agency`,
        website: 'https://example.com',
        description: 'Digital growth and web optimization consultancy helping high-potential businesses convert more visitors into loyal customers.',
        industry: 'Digital Services & Web Optimization',
        target_market: 'SMBs & Ecommerce Brands in North America and Europe',
        location: 'Remote',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Default Services
    const existingServices = await this.getServices(userId);
    if (existingServices.length === 0) {
      const defaultServices: Service[] = [
        {
          id: `srv_${userId}_1`,
          user_id: userId,
          name: 'Ecommerce Optimization',
          description: 'Improve mobile product page flow, checkout friction, and cart conversion for online stores.',
          price: '$2,500',
          target_customer: 'Shopify and WooCommerce merchants with $20k+ monthly sales',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `srv_${userId}_2`,
          user_id: userId,
          name: 'Website Redesign',
          description: 'Full modern redesign for outdated corporate or service websites needing stronger branding.',
          price: '$4,500',
          target_customer: 'Established B2B companies with websites older than 3 years',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `srv_${userId}_3`,
          user_id: userId,
          name: 'Conversion Rate Optimization (CRO)',
          description: 'A/B testing, CTA restructuring, and landing page friction reduction.',
          price: '$1,800/mo',
          target_customer: 'High-traffic SaaS and direct-to-consumer brands',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `srv_${userId}_4`,
          user_id: userId,
          name: 'Website Audit',
          description: 'Comprehensive 30-point evaluation covering UX, mobile speed, SEO, and trust signals.',
          price: '$650',
          target_customer: 'Businesses planning growth initiatives or marketing campaigns',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      for (const s of defaultServices) {
        await this.addService(userId, s);
      }
    }

    // Default ICP
    const existingICP = await this.getICP(userId);
    if (!existingICP) {
      await this.upsertICP(userId, {
        id: `icp_${userId}`,
        user_id: userId,
        industry: 'Ecommerce & Consumer Goods',
        company_size: '5 - 50 employees',
        location: 'United Kingdom, Germany, United States',
        buyer_role: 'Founder, Head of Ecommerce, Marketing Director',
        budget: '$2,000 - $10,000',
        pain_points: [
          'High mobile bounce rate on product catalog pages',
          'Poor checkout flow and lack of trusted payment badges',
          'Slow page loading times hurting organic search rankings',
        ],
        buying_signals: [
          'Recently launched new seasonal collection',
          'Active paid ad campaigns with unoptimized landing pages',
          'Job postings for digital marketing specialists',
        ],
        interests: ['Conversion optimization', 'Mobile responsiveness', 'Shopify Plus'],
        target_markets: ['Shopify Stores', 'Direct to Consumer Brands', 'Specialty Boutiques'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Default Settings
    const existingSettings = await this.getSettings(userId);
    if (!existingSettings) {
      await this.upsertSettings(userId, {
        id: `set_${userId}`,
        user_id: userId,
        default_channel: 'email',
        notification_preferences: {
          email_alerts: true,
          conversation_alerts: true,
          lead_alerts: true,
          campaign_alerts: true,
        },
        AI_preferences: {
          tone: 'consultative',
          preferred_outreach_style: 'problem_focused',
          auto_suggest_replies: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Default Subscription
    const existingSub = await this.getSubscription(userId);
    if (!existingSub) {
      await this.updateSubscription(userId, {
        id: `sub_${userId}`,
        user_id: userId,
        plan: 'growth',
        status: 'active',
        renewal_date: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Seed initial starter demo leads for this user (clearly marked as Demo Data)
    const existingLeads = await this.getLeads(userId);
    if (existingLeads.length === 0) {
      const demoLead1: Lead = {
        id: `lead_${userId}_1`,
        user_id: userId,
        company_name: 'Nordic Artisans GmbH',
        website: 'https://nordic-artisans.de',
        contact_name: 'Henrik Mueller',
        contact_email: 'henrik@nordic-artisans.de',
        industry: 'Ecommerce & Home Living',
        country: 'Germany',
        city: 'Hamburg',
        company_size: '11 - 25 employees',
        business_model: 'B2C Ecommerce',
        description: 'Sustainable Scandinavian home decor and handcrafted furniture sold across Central Europe.',
        source: 'Nexora Discovery',
        status: 'researched',
        is_demo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const demoLead2: Lead = {
        id: `lead_${userId}_2`,
        user_id: userId,
        company_name: 'Veloce Athletics UK',
        website: 'https://veloce-athletics.co.uk',
        contact_name: 'Sophie Clark',
        contact_email: 'sophie@veloce-athletics.co.uk',
        industry: 'Sportswear & Apparel',
        country: 'United Kingdom',
        city: 'Manchester',
        company_size: '15 - 40 employees',
        business_model: 'Direct to Consumer',
        description: 'Technical running gear and activewear brand running paid social traffic to mobile storefront.',
        source: 'Nexora Discovery',
        status: 'contacted',
        is_demo: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      };

      await this.createLead(userId, demoLead1);
      await this.createLead(userId, demoLead2);

      // Seed research for demoLead1
      await this.saveLeadResearch(userId, {
        id: `res_${userId}_1`,
        user_id: userId,
        lead_id: demoLead1.id,
        website_observations: [
          'High-res photography on desktop, but mobile catalog takes 3.8s to display above-the-fold content.',
          'Mobile sticky "Add to Cart" button is absent, requiring repeated scrolling.',
          'Trust badges and shipping guarantees are buried in deep footer links.',
        ],
        products_services: ['Artisan ceramics', 'Modular oak tables', 'Linen textiles'],
        target_audience: 'Affluent homeowners and interior design enthusiasts in DACH region',
        strengths: ['Striking product imagery', 'Authentic eco-conscious brand story', 'High organic review score'],
        weaknesses: ['Mobile checkout friction', 'Slow image loading on product pages', 'Low contrast on secondary buttons'],
        pain_points: ['Visitors abandon cart on smartphones', 'High customer acquisition cost due to sub-optimal conversion'],
        growth_opportunities: ['Streamline mobile checkout funnel', 'Add quick-buy modal', 'Highlight verified reviews on product detail pages'],
        buying_signals: ['Running Instagram promotional ads for spring catalog', 'Active hiring for junior ecommerce coordinator'],
        research_summary: 'Nordic Artisans has premium merchandise and strong brand resonance, but their mobile storefront suffers from checkout friction and slow asset delivery. Mobile visitors face multiple extra taps to complete purchases.',
        evidence: [
          'PageSpeed mobile score: 48/100',
          'Checkout funnel requires 4 separate page transitions',
          'Absence of Apple Pay / Google Pay express buttons on product view',
        ],
        confidence_score: 92,
        created_at: new Date().toISOString(),
      });

      // Seed score for demoLead1
      await this.saveLeadScore(userId, {
        id: `score_${userId}_1`,
        user_id: userId,
        lead_id: demoLead1.id,
        lead_quality: 91,
        need_strength: 88,
        service_match: 94,
        opportunity_score: 92,
        confidence_score: 92,
        reasoning: 'Clear alignment: merchant is actively running paid mobile traffic to an unoptimized checkout flow. Small targeted improvements in mobile CRO will yield immediate revenue lift.',
        created_at: new Date().toISOString(),
      });

      // Seed service match
      await this.saveLeadServiceMatch(userId, {
        id: `match_${userId}_1`,
        user_id: userId,
        lead_id: demoLead1.id,
        service_id: `srv_${userId}_1`,
        service_name: 'Ecommerce Optimization',
        match_score: 94,
        reasoning: 'Lead has strong product-market fit but mobile navigation and checkout friction are hurting conversion. Full redesign is unnecessary; high-impact optimization is the optimal solution.',
        evidence: 'Mobile speed lags by 3.8s, missing express checkout widgets, high cart abandonment markers.',
        created_at: new Date().toISOString(),
      });

      // Seed demo conversation for demoLead2 to demonstrate conversation memory
      const conv2: Conversation = {
        id: `conv_${userId}_2`,
        user_id: userId,
        lead_id: demoLead2.id,
        stage: 'replied',
        recommended_service: 'Ecommerce Optimization',
        prospect_need: 'Wants to know why mobile product page bounce rate is high before committing.',
        important_context: 'Sophie Clark (Head of Growth) responded to our first observation asking for specific details.',
        next_action: 'Explain specific mobile navigation findings concisely without overselling.',
        sentiment: 'positive',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      };
      await this.createConversation(userId, conv2);

      await this.addConversationMessage(userId, {
        id: `msg_${userId}_1`,
        user_id: userId,
        conversation_id: conv2.id,
        sender_type: 'user',
        channel: 'email',
        message: 'Hi Sophie, I noticed your mobile store experience for Veloce Athletics could likely be streamlined, particularly around product filtering and mobile checkout flow.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      });

      await this.addConversationMessage(userId, {
        id: `msg_${userId}_2`,
        user_id: userId,
        conversation_id: conv2.id,
        sender_type: 'prospect',
        channel: 'email',
        message: 'Thanks for reaching out. What exactly did you notice with our mobile filtering?',
        created_at: new Date(Date.now() - 43200000).toISOString(),
      });
    }
  }

  // --------------------------------------------------------------------------
  // PROFILES
  // --------------------------------------------------------------------------
  async getProfile(userId: string): Promise<Profile | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      return data || null;
    }
    const table = getTenantTable<Profile>(userId, 'profiles');
    return table.find((p) => p.user_id === userId) || null;
  }

  async upsertProfile(userId: string, profile: Profile): Promise<Profile> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
      if (error) throw error;
      return data;
    }
    const table = getTenantTable<Profile>(userId, 'profiles');
    const filtered = table.filter((p) => p.user_id !== userId);
    filtered.push(profile);
    saveTenantTable(userId, 'profiles', filtered);
    return profile;
  }

  // --------------------------------------------------------------------------
  // BUSINESSES
  // --------------------------------------------------------------------------
  async getBusiness(userId: string): Promise<Business | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('businesses').select('*').eq('user_id', userId).limit(1).maybeSingle();
      return data || null;
    }
    const table = getTenantTable<Business>(userId, 'businesses');
    return table.find((b) => b.user_id === userId) || null;
  }

  async upsertBusiness(userId: string, business: Business): Promise<Business> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('businesses').upsert(business).select().single();
      if (error) throw error;
      return data;
    }
    const table = getTenantTable<Business>(userId, 'businesses');
    const filtered = table.filter((b) => b.id !== business.id);
    filtered.push(business);
    saveTenantTable(userId, 'businesses', filtered);
    return business;
  }

  // --------------------------------------------------------------------------
  // SERVICES
  // --------------------------------------------------------------------------
  async getServices(userId: string): Promise<Service[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('services').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    }
    return getTenantTable<Service>(userId, 'services');
  }

  async addService(userId: string, service: Service): Promise<Service> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('services').insert(service).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<Service>(userId, 'services');
    list.unshift(service);
    saveTenantTable(userId, 'services', list);
    return service;
  }

  async updateService(userId: string, serviceId: string, updates: Partial<Service>): Promise<Service | null> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('services').update(updates).eq('id', serviceId).eq('user_id', userId).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<Service>(userId, 'services');
    const idx = list.findIndex((s) => s.id === serviceId && s.user_id === userId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      saveTenantTable(userId, 'services', list);
      return list[idx];
    }
    return null;
  }

  async deleteService(userId: string, serviceId: string): Promise<void> {
    if (!userId) return;
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.from('services').delete().eq('id', serviceId).eq('user_id', userId);
      return;
    }
    const list = getTenantTable<Service>(userId, 'services');
    saveTenantTable(userId, 'services', list.filter((s) => s.id !== serviceId));
  }

  // --------------------------------------------------------------------------
  // WEBSITE ANALYSES
  // --------------------------------------------------------------------------
  async getWebsiteAnalyses(userId: string): Promise<WebsiteAnalysis[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('website_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    }
    return getTenantTable<WebsiteAnalysis>(userId, 'website_analyses');
  }

  async saveWebsiteAnalysis(userId: string, analysis: WebsiteAnalysis): Promise<WebsiteAnalysis> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('website_analyses').insert(analysis).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<WebsiteAnalysis>(userId, 'website_analyses');
    list.unshift(analysis);
    saveTenantTable(userId, 'website_analyses', list);
    return analysis;
  }

  // --------------------------------------------------------------------------
  // IDEAL CUSTOMER PROFILE (ICP)
  // --------------------------------------------------------------------------
  async getICP(userId: string): Promise<IdealCustomerProfile | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('ideal_customer_profiles').select('*').eq('user_id', userId).limit(1).maybeSingle();
      return data || null;
    }
    const list = getTenantTable<IdealCustomerProfile>(userId, 'ideal_customer_profiles');
    return list.find((i) => i.user_id === userId) || null;
  }

  async upsertICP(userId: string, icp: IdealCustomerProfile): Promise<IdealCustomerProfile> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('ideal_customer_profiles').upsert(icp).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<IdealCustomerProfile>(userId, 'ideal_customer_profiles');
    const filtered = list.filter((i) => i.id !== icp.id);
    filtered.push(icp);
    saveTenantTable(userId, 'ideal_customer_profiles', filtered);
    return icp;
  }

  // --------------------------------------------------------------------------
  // LEADS
  // --------------------------------------------------------------------------
  async getLeads(userId: string): Promise<Lead[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('leads').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    }
    return getTenantTable<Lead>(userId, 'leads');
  }

  async getLeadById(userId: string, leadId: string): Promise<Lead | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('leads').select('*').eq('id', leadId).eq('user_id', userId).single();
      return data || null;
    }
    const leads = getTenantTable<Lead>(userId, 'leads');
    return leads.find((l) => l.id === leadId && l.user_id === userId) || null;
  }

  async createLead(userId: string, lead: Lead): Promise<Lead> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').insert(lead).select().single();
      if (error) throw error;
      return data;
    }
    const leads = getTenantTable<Lead>(userId, 'leads');
    leads.unshift(lead);
    saveTenantTable(userId, 'leads', leads);
    return lead;
  }

  async updateLead(userId: string, leadId: string, updates: Partial<Lead>): Promise<Lead | null> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').update(updates).eq('id', leadId).eq('user_id', userId).select().single();
      if (error) throw error;
      return data;
    }
    const leads = getTenantTable<Lead>(userId, 'leads');
    const idx = leads.findIndex((l) => l.id === leadId && l.user_id === userId);
    if (idx !== -1) {
      leads[idx] = { ...leads[idx], ...updates, updated_at: new Date().toISOString() };
      saveTenantTable(userId, 'leads', leads);
      return leads[idx];
    }
    return null;
  }

  async deleteLead(userId: string, leadId: string): Promise<void> {
    if (!userId) return;
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.from('leads').delete().eq('id', leadId).eq('user_id', userId);
      return;
    }
    const leads = getTenantTable<Lead>(userId, 'leads');
    saveTenantTable(userId, 'leads', leads.filter((l) => l.id !== leadId));
  }

  // --------------------------------------------------------------------------
  // LEAD RESEARCH & SCORES & MATCHES
  // --------------------------------------------------------------------------
  async getLeadResearch(userId: string, leadId: string): Promise<LeadResearch | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('lead_research').select('*').eq('lead_id', leadId).eq('user_id', userId).maybeSingle();
      return data || null;
    }
    const list = getTenantTable<LeadResearch>(userId, 'lead_research');
    return list.find((r) => r.lead_id === leadId && r.user_id === userId) || null;
  }

  async saveLeadResearch(userId: string, research: LeadResearch): Promise<LeadResearch> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lead_research').upsert(research).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<LeadResearch>(userId, 'lead_research');
    const filtered = list.filter((r) => r.lead_id !== research.lead_id);
    filtered.push(research);
    saveTenantTable(userId, 'lead_research', filtered);
    return research;
  }

  async getLeadScores(userId: string, leadId: string): Promise<LeadScore | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('lead_scores').select('*').eq('lead_id', leadId).eq('user_id', userId).maybeSingle();
      return data || null;
    }
    const list = getTenantTable<LeadScore>(userId, 'lead_scores');
    return list.find((s) => s.lead_id === leadId && s.user_id === userId) || null;
  }

  async saveLeadScore(userId: string, score: LeadScore): Promise<LeadScore> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lead_scores').upsert(score).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<LeadScore>(userId, 'lead_scores');
    const filtered = list.filter((s) => s.lead_id !== score.lead_id);
    filtered.push(score);
    saveTenantTable(userId, 'lead_scores', filtered);
    return score;
  }

  async getLeadServiceMatches(userId: string, leadId: string): Promise<LeadServiceMatch[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('lead_service_matches').select('*').eq('lead_id', leadId).eq('user_id', userId);
      return data || [];
    }
    const list = getTenantTable<LeadServiceMatch>(userId, 'lead_service_matches');
    return list.filter((m) => m.lead_id === leadId && m.user_id === userId);
  }

  async saveLeadServiceMatch(userId: string, match: LeadServiceMatch): Promise<LeadServiceMatch> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lead_service_matches').insert(match).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<LeadServiceMatch>(userId, 'lead_service_matches');
    list.unshift(match);
    saveTenantTable(userId, 'lead_service_matches', list);
    return match;
  }

  // --------------------------------------------------------------------------
  // LEAD LISTS & MEMBERS
  // --------------------------------------------------------------------------
  async getLeadLists(userId: string): Promise<LeadList[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('lead_lists').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    }
    return getTenantTable<LeadList>(userId, 'lead_lists');
  }

  async createLeadList(userId: string, list: LeadList): Promise<LeadList> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lead_lists').insert(list).select().single();
      if (error) throw error;
      return data;
    }
    const lists = getTenantTable<LeadList>(userId, 'lead_lists');
    lists.unshift(list);
    saveTenantTable(userId, 'lead_lists', lists);
    return list;
  }

  async addLeadToList(userId: string, listId: string, leadId: string): Promise<void> {
    if (!userId) return;
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.from('lead_list_members').insert({
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        user_id: userId,
        lead_list_id: listId,
        lead_id: leadId,
      });
      return;
    }
    const members = getTenantTable<LeadListMember>(userId, 'lead_list_members');
    if (!members.some((m) => m.lead_list_id === listId && m.lead_id === leadId)) {
      members.push({
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        user_id: userId,
        lead_list_id: listId,
        lead_id: leadId,
        created_at: new Date().toISOString(),
      });
      saveTenantTable(userId, 'lead_list_members', members);
    }
  }

  async getLeadListMembers(userId: string, listId: string): Promise<LeadListMember[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('lead_list_members').select('*').eq('lead_list_id', listId).eq('user_id', userId);
      return data || [];
    }
    const members = getTenantTable<LeadListMember>(userId, 'lead_list_members');
    return members.filter((m) => m.lead_list_id === listId && m.user_id === userId);
  }

  // --------------------------------------------------------------------------
  // CAMPAIGNS & CAMPAIGN LEADS
  // --------------------------------------------------------------------------
  async getCampaigns(userId: string): Promise<Campaign[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    }
    return getTenantTable<Campaign>(userId, 'campaigns');
  }

  async createCampaign(userId: string, campaign: Campaign): Promise<Campaign> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<Campaign>(userId, 'campaigns');
    list.unshift(campaign);
    saveTenantTable(userId, 'campaigns', list);
    return campaign;
  }

  async updateCampaignStatus(userId: string, campaignId: string, status: Campaign['status']): Promise<void> {
    if (!userId) return;
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.from('campaigns').update({ status, updated_at: new Date().toISOString() }).eq('id', campaignId).eq('user_id', userId);
      return;
    }
    const list = getTenantTable<Campaign>(userId, 'campaigns');
    const idx = list.findIndex((c) => c.id === campaignId && c.user_id === userId);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].updated_at = new Date().toISOString();
      saveTenantTable(userId, 'campaigns', list);
    }
  }

  async getCampaignLeads(userId: string, campaignId: string): Promise<CampaignLead[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('campaign_leads').select('*').eq('campaign_id', campaignId).eq('user_id', userId);
      return data || [];
    }
    const list = getTenantTable<CampaignLead>(userId, 'campaign_leads');
    return list.filter((cl) => cl.campaign_id === campaignId && cl.user_id === userId);
  }

  async addLeadToCampaign(userId: string, campaignLead: CampaignLead): Promise<void> {
    if (!userId) return;
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.from('campaign_leads').insert(campaignLead);
      return;
    }
    const list = getTenantTable<CampaignLead>(userId, 'campaign_leads');
    list.push(campaignLead);
    saveTenantTable(userId, 'campaign_leads', list);
  }

  // --------------------------------------------------------------------------
  // CONVERSATIONS & CONVERSATION MESSAGES (Conversation Memory)
  // --------------------------------------------------------------------------
  async getConversations(userId: string): Promise<Conversation[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('conversations').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      return data || [];
    }
    return getTenantTable<Conversation>(userId, 'conversations');
  }

  async getConversationById(userId: string, convId: string): Promise<Conversation | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('conversations').select('*').eq('id', convId).eq('user_id', userId).single();
      return data || null;
    }
    const list = getTenantTable<Conversation>(userId, 'conversations');
    return list.find((c) => c.id === convId && c.user_id === userId) || null;
  }

  async createConversation(userId: string, conv: Conversation): Promise<Conversation> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('conversations').insert(conv).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<Conversation>(userId, 'conversations');
    list.unshift(conv);
    saveTenantTable(userId, 'conversations', list);
    return conv;
  }

  async updateConversationStage(userId: string, convId: string, stage: Conversation['stage'], updates?: Partial<Conversation>): Promise<void> {
    if (!userId) return;
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.from('conversations').update({ stage, ...updates, updated_at: new Date().toISOString() }).eq('id', convId).eq('user_id', userId);
      return;
    }
    const list = getTenantTable<Conversation>(userId, 'conversations');
    const idx = list.findIndex((c) => c.id === convId && c.user_id === userId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], stage, ...updates, updated_at: new Date().toISOString() };
      saveTenantTable(userId, 'conversations', list);
    }
  }

  async getConversationMessages(userId: string, conversationId: string): Promise<ConversationMessage[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('conversation_messages').select('*').eq('conversation_id', conversationId).eq('user_id', userId).order('created_at', { ascending: true });
      return data || [];
    }
    const list = getTenantTable<ConversationMessage>(userId, 'conversation_messages');
    return list.filter((m) => m.conversation_id === conversationId && m.user_id === userId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async addConversationMessage(userId: string, message: ConversationMessage): Promise<ConversationMessage> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('conversation_messages').insert(message).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<ConversationMessage>(userId, 'conversation_messages');
    list.push(message);
    saveTenantTable(userId, 'conversation_messages', list);
    return message;
  }

  // --------------------------------------------------------------------------
  // OUTREACH DRAFTS
  // --------------------------------------------------------------------------
  async getOutreachDrafts(userId: string, leadId?: string): Promise<OutreachDraft[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      let query = supabase.from('outreach_drafts').select('*').eq('user_id', userId);
      if (leadId) query = query.eq('lead_id', leadId);
      const { data } = await query.order('created_at', { ascending: false });
      return data || [];
    }
    const list = getTenantTable<OutreachDraft>(userId, 'outreach_drafts');
    return leadId ? list.filter((d) => d.lead_id === leadId) : list;
  }

  async saveOutreachDraft(userId: string, draft: OutreachDraft): Promise<OutreachDraft> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('outreach_drafts').upsert(draft).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<OutreachDraft>(userId, 'outreach_drafts');
    const filtered = list.filter((d) => d.id !== draft.id);
    filtered.unshift(draft);
    saveTenantTable(userId, 'outreach_drafts', filtered);
    return draft;
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    }
    return getTenantTable<Notification>(userId, 'notifications');
  }

  async markNotificationRead(userId: string, id: string): Promise<void> {
    if (!userId) return;
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', userId);
      return;
    }
    const list = getTenantTable<Notification>(userId, 'notifications');
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].read = true;
      saveTenantTable(userId, 'notifications', list);
    }
  }

  // --------------------------------------------------------------------------
  // USAGE & SUBSCRIPTION & SETTINGS
  // --------------------------------------------------------------------------
  async getUsage(userId: string): Promise<Usage[]> {
    if (!userId) return [];
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('usage').select('*').eq('user_id', userId);
      return data || [];
    }
    return getTenantTable<Usage>(userId, 'usage');
  }

  async recordUsage(userId: string, feature: string): Promise<void> {
    if (!userId) return;
    const currentPeriod = new Date().toISOString().substring(0, 7);
    if (isLiveSupabaseConfigured && supabase) {
      // In supabase, upsert or increment
      return;
    }
    const list = getTenantTable<Usage>(userId, 'usage');
    const found = list.find((u) => u.feature === feature && u.period === currentPeriod);
    if (found) {
      found.usage_count += 1;
      found.updated_at = new Date().toISOString();
    } else {
      list.push({
        id: `use_${Date.now()}`,
        user_id: userId,
        feature,
        usage_count: 1,
        period: currentPeriod,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    saveTenantTable(userId, 'usage', list);
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
      return data || null;
    }
    const list = getTenantTable<Subscription>(userId, 'subscriptions');
    return list.find((s) => s.user_id === userId) || null;
  }

  async updateSubscription(userId: string, sub: Subscription): Promise<Subscription> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('subscriptions').upsert(sub).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<Subscription>(userId, 'subscriptions');
    const filtered = list.filter((s) => s.user_id !== userId);
    filtered.push(sub);
    saveTenantTable(userId, 'subscriptions', filtered);
    return sub;
  }

  async getSettings(userId: string): Promise<Settings | null> {
    if (!userId) return null;
    if (isLiveSupabaseConfigured && supabase) {
      const { data } = await supabase.from('settings').select('*').eq('user_id', userId).maybeSingle();
      return data || null;
    }
    const list = getTenantTable<Settings>(userId, 'settings');
    return list.find((s) => s.user_id === userId) || null;
  }

  async upsertSettings(userId: string, settings: Settings): Promise<Settings> {
    if (!userId) throw new Error('user_id required');
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('settings').upsert(settings).select().single();
      if (error) throw error;
      return data;
    }
    const list = getTenantTable<Settings>(userId, 'settings');
    const filtered = list.filter((s) => s.user_id !== userId);
    filtered.push(settings);
    saveTenantTable(userId, 'settings', filtered);
    return settings;
  }

  // --------------------------------------------------------------------------
  // SUPPORT TICKETS (Every user has access to support)
  // --------------------------------------------------------------------------
  async submitSupportTicket(ticket: Omit<SupportTicket, 'id' | 'status' | 'created_at'>): Promise<SupportTicket> {
    const fullTicket: SupportTicket = {
      ...ticket,
      id: `tick_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'received',
      created_at: new Date().toISOString(),
    };

    if (ticket.user_id) {
      if (isLiveSupabaseConfigured && supabase) {
        await supabase.from('support_tickets').insert(fullTicket);
      } else {
        const list = getTenantTable<SupportTicket>(ticket.user_id, 'support_tickets');
        list.unshift(fullTicket);
        saveTenantTable(ticket.user_id, 'support_tickets', list);
      }
    }

    return fullTicket;
  }
}

export const dbService = new DatabaseService();
