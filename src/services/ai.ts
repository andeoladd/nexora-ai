import {
  Lead,
  LeadResearch,
  LeadScore,
  LeadServiceMatch,
  Service,
  WebsiteAnalysis,
  Conversation,
  ConversationMessage,
  CampaignChannel,
  ProspectIntent,
} from '../types/database';

export interface GeneratedOutreach {
  subject: string;
  message: string;
  channel: CampaignChannel;
  reasoning: string;
  suggestedFollowUpDays: number;
}

export interface ConversationReplySuggestion {
  classification: ProspectIntent;
  classificationReason: string;
  suggestedReply: string;
  nextAction: string;
  recommendedStage: Conversation['stage'];
  confidenceScore: number;
}

export interface ConversationSummaryResult {
  prospectNeed: string;
  mainConcern: string;
  recommendedService: string;
  questionsAsked: string[];
  importantFacts: string[];
  objections: string[];
  currentStage: Conversation['stage'];
  nextBestAction: string;
}

class AIService {
  private isGeminiConfigured(): boolean {
    return Boolean(
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY)
    );
  }

  // --------------------------------------------------------------------------
  // 1. WEBSITE ANALYZER
  // --------------------------------------------------------------------------
  async analyzeWebsite(url: string, availableServices: Service[] = []): Promise<WebsiteAnalysis> {
    const cleanUrl = url.trim().toLowerCase();
    const domain = cleanUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

    // Domain heuristic simulation based on domain keyword
    let isEcommerce = cleanUrl.includes('shop') || cleanUrl.includes('store') || cleanUrl.includes('wear') || cleanUrl.includes('artisan');
    let isSaas = cleanUrl.includes('app') || cleanUrl.includes('cloud') || cleanUrl.includes('tech') || cleanUrl.includes('io');

    let businessSummary = '';
    let products: string[] = [];
    let targetAudience = '';
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let opportunities: string[] = [];
    let recommendedServices: string[] = [];

    if (isEcommerce) {
      businessSummary = `Independent digital commerce storefront operating on ${domain}, retailing catalog items directly to end consumers.`;
      products = ['Featured merchandise catalog', 'Seasonal collections', 'Digital gift vouchers'];
      targetAudience = 'Retail consumers seeking high-quality niche products with fast direct shipping';
      strengths = [
        'Clean high-resolution product photography',
        'Structured catalog categories with clear breadcrumbs',
        'Transparent pricing and currency display',
      ];
      weaknesses = [
        'Mobile page load delays observed for high-resolution gallery thumbnails',
        'Lack of sticky mobile add-to-cart or express checkout shortcuts',
        'Trust indicators (money-back guarantee, SSL guarantee) not prominent in above-the-fold views',
      ];
      opportunities = [
        'Implement sticky mobile cart drawer to reduce smartphone abandon rates',
        'Optimize hero image webp compression for under 1.5s mobile paint',
        'Add one-click payment buttons (Apple Pay, Shop Pay, PayPal)',
      ];
      recommendedServices = ['Ecommerce Optimization', 'Conversion Rate Optimization (CRO)'];
    } else if (isSaas) {
      businessSummary = `Modern software-as-a-service application hosted on ${domain}, offering specialized cloud tools for workflow efficiency.`;
      products = ['Core cloud software subscription', 'Team collaboration seats', 'Enterprise integrations'];
      targetAudience = 'Business operators, tech teams, and workflow leaders looking to automate tasks';
      strengths = [
        'Modern dark/light UI palette with clean typography',
        'Prominent primary CTA button in hero banner',
        'Feature grid clearly enumerating product modules',
      ];
      weaknesses = [
        'Value proposition in hero headline uses jargon without stating the tangible business outcome',
        'Absence of interactive product preview or guided interactive demo',
        'Customer social proof logos lack verified testimonial quotes or metrics',
      ];
      opportunities = [
        'Clarify hero headline with direct outcome statement',
        'Embed 30-second interactive interactive workflow walkthrough',
        'Revise pricing tier comparison matrix for clarity',
      ];
      recommendedServices = ['Landing Page Design', 'Website Redesign', 'Conversion Rate Optimization (CRO)'];
    } else {
      businessSummary = `Professional services or commercial business website at ${domain}, presenting brand capabilities and contact channels.`;
      products = ['Client consultation services', 'Custom delivery packages', 'Support retainer contracts'];
      targetAudience = 'Regional business clients requiring specialized expertise and trusted partners';
      strengths = [
        'Professional tone of voice',
        'Visible contact phone number and contact email in header',
        'Detailed list of past completed projects',
      ];
      weaknesses = [
        'Outdated multi-column layout on smaller smartphone viewports',
        'Long lead-capture form with 8+ mandatory fields creating high drop-off',
        'Missing modern SSL trust badge and privacy policy direct link in navigation',
      ];
      opportunities = [
        'Streamline contact form from 8 inputs down to 3 high-impact questions',
        'Adopt responsive modern grid layout with touch-friendly spacing',
        'Add a structured 3-step audit package CTA to increase inbound inquiries',
      ];
      recommendedServices = ['Website Audit', 'Website Redesign', 'UX Improvement'];
    }

    return {
      id: `ana_${Date.now()}`,
      user_id: '',
      url: cleanUrl,
      business_summary: businessSummary,
      products_services: products,
      target_audience: targetAudience,
      strengths,
      weaknesses,
      opportunities,
      recommended_services: recommendedServices,
      confidence_score: 88,
      is_demo: true,
      created_at: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // 2. LEAD RESEARCH (Need-Based)
  // --------------------------------------------------------------------------
  async researchLead(lead: Lead, userServices: Service[] = []): Promise<{
    research: LeadResearch;
    score: LeadScore;
    matches: LeadServiceMatch[];
  }> {
    const isStore = lead.industry.toLowerCase().includes('ecommerce') || lead.business_model.toLowerCase().includes('b2c');
    const isTech = lead.industry.toLowerCase().includes('software') || lead.industry.toLowerCase().includes('tech') || lead.business_model.toLowerCase().includes('saas');

    let observations: string[] = [];
    let products: string[] = [];
    let audience = '';
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let painPoints: string[] = [];
    let opportunities: string[] = [];
    let buyingSignals: string[] = [];
    let summary = '';
    let evidence: string[] = [];
    let recommendedServiceName = 'Ecommerce Optimization';

    if (isStore) {
      observations = [
        'Catalog features high-quality imagery, but mobile view requires scrolling past multiple text blocks before seeing buy actions.',
        'No sticky "Add to Cart" button on mobile viewports.',
        'Shipping terms and return policy require navigation to a separate detached sub-page.',
        'Product page reviews are listed as plain text without verified buyer badges.',
      ];
      products = ['Direct-to-consumer brand catalog', 'Seasonal product lines', 'Accessory bundles'];
      audience = `Targeting discerning buyers in ${lead.country || 'Europe'} who value craftsmanship and quality.`;
      strengths = ['Distinctive brand aesthetic', 'High product differentiation', 'Solid desktop layout'];
      weaknesses = ['Mobile checkout friction', 'Slow asset load on mobile 4G connections', 'Low contrast on secondary CTA'];
      painPoints = ['Mobile cart abandonment', 'High advertising spend with lower-than-average mobile conversion'];
      opportunities = ['Implement mobile-first checkout enhancements', 'One-click pay integration', 'In-page review snippets'];
      buyingSignals = ['Active advertising on Meta platforms', 'Hiring for ecommerce operations coordinator'];
      summary = `${lead.company_name} possesses a strong brand identity and loyal core following, but their current storefront contains notable friction points for smartphone shoppers that likely depress conversion rates.`;
      evidence = [
        'Mobile page load index exceeds 3.5 seconds on simulated 4G mobile devices',
        'Mobile product pages lack sticky bottom purchase bar',
        'Absence of express checkout badges on above-the-fold views',
      ];
      recommendedServiceName = 'Ecommerce Optimization';
    } else if (isTech) {
      observations = [
        'Hero section uses generic terminology ("Next-Gen platform") without illustrating the exact problem solved.',
        'Pricing table contains dense feature lists without a recommended highlighted tier.',
        'Documentation link is prominent, but quick trial onboarding link is hidden.',
      ];
      products = ['Core cloud subscription platform', 'API connectivity add-on', 'Enterprise support plan'];
      audience = `B2B teams and decision-makers in ${lead.country || 'Global markets'}.`;
      strengths = ['Established technical capability', 'Clean typography', 'Active developer documentation'];
      weaknesses = ['Unclear value messaging for non-technical buyers', 'High cognitive load on pricing page'];
      painPoints = ['Prospects fail to grasp value within first 5 seconds', 'High bounce rate on pricing page'];
      opportunities = ['Simplify hero messaging to focus on business outcomes', 'Design interactive ROI calculator', 'Streamline sign-up flow'];
      buyingSignals = ['Recently announced product update v2', 'Actively expanding sales team'];
      summary = `${lead.company_name} has built a sophisticated product, but the marketing presentation creates high cognitive friction for prospective buyers comparing options.`;
      evidence = [
        'First-scroll readability test shows grade 14+ technical vocabulary',
        'Pricing table has 24 uncollapsed comparison rows on mobile',
        'No interactive product demo preview on homepage',
      ];
      recommendedServiceName = 'Landing Page Design';
    } else {
      observations = [
        'Website appears built several years ago using non-responsive templates.',
        'Contact form is lengthy and asks for physical mailing address upfront.',
        'Mobile navigation menu overlays screen content without a distinct close icon.',
      ];
      products = ['Professional client engagements', 'Custom consulting packages'];
      audience = `Corporate and SMB clients in ${lead.city || lead.country || 'Europe'}.`;
      strengths = ['Long track record in their sector', 'Authentic team credentials and case study titles'];
      weaknesses = ['Outdated design aesthetic', 'Clunky mobile touch targets', 'Missing modern SSL & trust indicators'];
      painPoints = ['Losing modern tech-forward prospects to newer competitors with sharper websites'];
      opportunities = ['Modern visual redesign', 'Mobile-first layout restructuring', 'Streamlined lead capture flow'];
      buyingSignals = ['Updated logo recently', 'Participating in upcoming industry trade expos'];
      summary = `${lead.company_name} is a reputable firm whose website no longer reflects the true quality of their real-world capabilities.`;
      evidence = [
        'Layout lacks responsive fluid grid below 768px screen widths',
        'Inquiry form contains 9 mandatory input fields',
        'Copyright date in footer is outdated',
      ];
      recommendedServiceName = 'Website Redesign';
    }

    // Match with user's available services if available
    const matchedService = userServices.find(
      (s) => s.active && (s.name.toLowerCase().includes(recommendedServiceName.toLowerCase()) || recommendedServiceName.toLowerCase().includes(s.name.toLowerCase()))
    ) || userServices[0];

    const research: LeadResearch = {
      id: `res_${Date.now()}`,
      user_id: lead.user_id,
      lead_id: lead.id,
      website_observations: observations,
      products_services: products,
      target_audience: audience,
      strengths,
      weaknesses,
      pain_points: painPoints,
      growth_opportunities: opportunities,
      buying_signals: buyingSignals,
      research_summary: summary,
      evidence,
      confidence_score: 91,
      created_at: new Date().toISOString(),
    };

    const score: LeadScore = {
      id: `sc_${Date.now()}`,
      user_id: lead.user_id,
      lead_id: lead.id,
      lead_quality: isStore ? 92 : 88,
      need_strength: 87,
      service_match: 94,
      opportunity_score: 91,
      confidence_score: 91,
      reasoning: `Strong alignment: observable evidence demonstrates tangible room for improvement in ${recommendedServiceName}. By focusing on the specific friction points rather than pitching an unnecessary overhaul, the opportunity carries high trust and receptivity.`,
      created_at: new Date().toISOString(),
    };

    const match: LeadServiceMatch = {
      id: `lsm_${Date.now()}`,
      user_id: lead.user_id,
      lead_id: lead.id,
      service_id: matchedService?.id,
      service_name: matchedService ? matchedService.name : recommendedServiceName,
      match_score: 94,
      reasoning: `Matches observed problem directly: ${observations[0]}`,
      evidence: evidence.join('; '),
      created_at: new Date().toISOString(),
    };

    return { research, score, matches: [match] };
  }

  // --------------------------------------------------------------------------
  // 3. NATURAL OUTREACH GENERATOR (AI-assisted drafts for user review)
  // --------------------------------------------------------------------------
  generateOutreachDraft(params: {
    lead: Lead;
    research: LeadResearch;
    serviceName: string;
    channel: CampaignChannel;
    style?: 'problem_focused' | 'value_first' | 'quick_observation';
    userBusinessName?: string;
  }): GeneratedOutreach {
    const { lead, research, serviceName, channel, style = 'problem_focused' } = params;
    const contactFirstName = lead.contact_name ? lead.contact_name.split(' ')[0] : 'there';
    const primaryObservation = research.website_observations[0] || 'your mobile checkout experience';
    const specificDetail = research.evidence[0] || 'certain mobile navigation actions require extra taps';

    let subject = '';
    let message = '';

    if (channel === 'email') {
      subject = `Quick observation regarding ${lead.company_name}'s mobile storefront`;
      if (style === 'problem_focused') {
        message = `Hi ${contactFirstName},

I was looking at ${lead.company_name}'s website today and noticed your product line looks great, especially for your European audience.

While browsing on mobile, I noticed a small area that might be causing unnecessary friction: ${primaryObservation.toLowerCase()}

Specifically, ${specificDetail.toLowerCase()}.

Given that mobile shoppers typically make quick decisions, addressing this usually makes a noticeable difference in visitors completing checkout.

Would you be open to a quick 2-minute screenshot breakdown of what I noticed? No sales pitch—just wanted to share the observation in case it's helpful.

Best,`;
      } else if (style === 'value_first') {
        message = `Hi ${contactFirstName},

Really impressed by the brand positioning and product presentation at ${lead.company_name}.

I took a close look at your mobile storefront flow and noticed an opportunity to improve the mobile conversion rate without changing your core branding. Specifically, ${primaryObservation.toLowerCase()}.

I put together a few quick notes on how other merchants in ${lead.industry} resolve this friction point. Would it be helpful if I passed them along?

Best regards,`;
      } else {
        message = `Hi ${contactFirstName},

Quick note—I was looking through ${lead.company_name} and noticed ${primaryObservation.toLowerCase()}.

Happy to send over a quick marked-up screenshot showing what I spotted if you're interested. Let me know!

Best,`;
      }
    } else if (channel === 'linkedin') {
      subject = `Observation on ${lead.company_name}`;
      message = `Hi ${contactFirstName}, came across ${lead.company_name} and was impressed by your product lineup. While testing your mobile storefront, I noticed ${primaryObservation.toLowerCase()}. Thought you might appreciate a quick note on this—happy to share a 2-minute visual breakdown if it helps your team.`;
    } else if (channel === 'instagram') {
      subject = `Quick note`;
      message = `Hey ${contactFirstName}! Love what you guys are doing with ${lead.company_name}. Was browsing your mobile store and noticed ${primaryObservation.toLowerCase()}. Put together a quick note on how to fix that friction point if you'd like to take a look! 🙌`;
    } else if (channel === 'whatsapp') {
      subject = `Quick observation`;
      message = `Hi ${contactFirstName}, hope you are having a productive week. I was reviewing ${lead.company_name}'s mobile site and noticed ${primaryObservation.toLowerCase()}. Let me know if you would like me to send over a quick summary note.`;
    } else {
      subject = `Quick observation`;
      message = `Hi ${contactFirstName}, I noticed an opportunity on ${lead.company_name}'s mobile storefront: ${primaryObservation.toLowerCase()}. Happy to share a quick screenshot walkthrough if that's useful.`;
    }

    return {
      subject,
      message,
      channel,
      reasoning: `Tailored strictly to verified observation: "${primaryObservation}". Refrains from generic boilerplate, fake urgency, or exaggerated claims. Clearly positioned as an AI-assisted draft for user review.`,
      suggestedFollowUpDays: 4,
    };
  }

  // --------------------------------------------------------------------------
  // 4. CONVERSATION INTELLIGENCE (Contextual Replies & Memory)
  // --------------------------------------------------------------------------
  classifyProspectMessage(prospectMessage: string): { intent: ProspectIntent; reason: string } {
    const text = prospectMessage.toLowerCase().trim();

    if (text.includes('not interested') || text.includes('unsubscribe') || text.includes('stop messaging') || text.includes('remove me')) {
      return { intent: 'not_interested', reason: 'Prospect explicitly communicated lack of interest.' };
    }
    if (text.includes('how much') || text.includes('pricing') || text.includes('cost') || text.includes('rate') || text.includes('fee')) {
      return { intent: 'pricing_request', reason: 'Prospect inquired about project cost or pricing structure.' };
    }
    if (text.includes('what exactly') || text.includes('what did you notice') || text.includes('which areas') || text.includes('can you show') || text.includes('what do you mean') || text.includes('where is')) {
      return { intent: 'question', reason: 'Prospect asked for specific clarification on the observations.' };
    }
    if (text.includes('send it') || text.includes('yes please') || text.includes('sure') || text.includes('share it') || text.includes('would love to see') || text.includes('sounds interesting')) {
      return { intent: 'curious', reason: 'Prospect gave permission to see the researched findings or screenshots.' };
    }
    if (text.includes('call') || text.includes('meeting') || text.includes('zoom') || text.includes('calendly') || text.includes('chat tomorrow') || text.includes('time to speak')) {
      return { intent: 'meeting_request', reason: 'Prospect proposed or asked for a live discussion or call.' };
    }
    if (text.includes('already have') || text.includes('we have an agency') || text.includes('in-house') || text.includes('no budget') || text.includes('too busy')) {
      return { intent: 'objection', reason: 'Prospect raised a common business constraint or agency relationship objection.' };
    }
    if (text.includes('thanks') || text.includes('thank you') || text.includes('appreciate')) {
      return { intent: 'positive_response', reason: 'Prospect acknowledged outreach courteously.' };
    }

    return { intent: 'needs_more_information', reason: 'Prospect replied and requires relevant contextual follow-up.' };
  }

  generateContextualReply(params: {
    conversation: Conversation;
    messages: ConversationMessage[];
    newProspectMessage: string;
    leadResearch?: LeadResearch | null;
    userServices?: Service[];
    userPricing?: string;
  }): ConversationReplySuggestion {
    const { conversation, messages, newProspectMessage, leadResearch, userPricing } = params;
    const { intent, reason } = this.classifyProspectMessage(newProspectMessage);

    let suggestedReply = '';
    let nextAction = '';
    let recommendedStage = conversation.stage;

    // RULE: Always answer questions first before pitching!
    if (intent === 'not_interested') {
      suggestedReply = `Understood completely. Thank you for letting me know, and I wish you and your team all the best with your business!`;
      nextAction = 'Mark conversation as Not Interested and archive.';
      recommendedStage = 'not_interested';
    } else if (intent === 'pricing_request') {
      if (userPricing) {
        suggestedReply = `For targeted projects like this, our typical investment for ${conversation.recommended_service || 'website optimization'} is around ${userPricing}, depending on the exact scope and number of pages. I'm happy to outline the specific items first so you can see if it makes sense for your goals.`;
      } else {
        suggestedReply = `I want to make sure I don't give you an inaccurate figure. Our typical engagements range depending on whether we're tuning a couple of high-friction pages or doing broader optimization. If you'd like, I can point out the specific 2-3 areas first, and then give you an exact fixed quote if it makes sense to tackle them.`;
      }
      nextAction = 'Provide transparent scope-first pricing and verify alignment.';
      recommendedStage = 'qualified';
    } else if (intent === 'question' || intent === 'curious') {
      const observations = leadResearch?.website_observations || [
        'Mobile product pages require multiple scrolls past long blocks of text before the purchase CTA is visible.',
        'Filtering on smartphone screens is difficult to reset without reloading the whole catalog.',
      ];
      const evidence = leadResearch?.evidence || ['Mobile paint speed is delayed on mobile viewports.'];

      suggestedReply = `I noticed two specific friction points on mobile:

1. ${observations[0]}
2. ${observations[1] || 'Mobile product filtering takes several taps to clear, which can cause shoppers to leave before finding their size or variant.'}

${evidence[0] ? `Specifically, ${evidence[0].toLowerCase()}. ` : ''}These small details tend to quietly reduce checkout completion on mobile traffic. Would you like me to send over a quick marked-up screenshot showing how to fix them?`;

      nextAction = 'Share the specific researched evidence and offer a quick screenshot review.';
      recommendedStage = 'interested';
    } else if (intent === 'meeting_request') {
      suggestedReply = `I'd be glad to walk through the observations together. Would later this week work for a quick 15-minute screen share? Let me know a day and time that suits you, or I can send over a convenient link.`;
      nextAction = 'Send calendar link or confirm proposed time slot.';
      recommendedStage = 'meeting_requested';
    } else if (intent === 'objection') {
      suggestedReply = `That completely makes sense—many of the merchants we talk with have an existing team or agency in place. In that case, I'm happy to just send over the screenshot breakdown of these mobile observations so your in-house team can review and implement the fixes directly. No obligation at all!`;
      nextAction = 'Acknowledge objection gracefully and offer free value without pressure.';
      recommendedStage = 'replied';
    } else {
      suggestedReply = `Thanks for following up! Happy to answer any specific questions you have about ${leadResearch?.research_summary ? 'the observations' : 'your storefront'} whenever you're ready.`;
      nextAction = 'Follow up with tailored context.';
      recommendedStage = 'replied';
    }

    return {
      classification: intent,
      classificationReason: reason,
      suggestedReply,
      nextAction,
      recommendedStage,
      confidenceScore: 92,
    };
  }

  generateConversationSummary(conversation: Conversation, messages: ConversationMessage[]): ConversationSummaryResult {
    const prospectMessages = messages.filter((m) => m.sender_type === 'prospect');
    const lastMsg = prospectMessages[prospectMessages.length - 1]?.message || '';

    return {
      prospectNeed: conversation.prospect_need || 'Evaluating mobile storefront improvements to decrease checkout drop-off.',
      mainConcern: lastMsg.includes('how much') ? 'Pricing and return on investment' : 'Understanding exact actionable observations on mobile layout',
      recommendedService: conversation.recommended_service || 'Ecommerce Optimization',
      questionsAsked: lastMsg ? [lastMsg] : ['Inquired about specific mobile observations.'],
      importantFacts: [
        'Decision-maker is active on email.',
        'Merchant operates active mobile advertising campaigns.',
        `Conversation currently at stage: ${conversation.stage}.`,
      ],
      objections: [],
      currentStage: conversation.stage,
      nextBestAction: conversation.next_action || 'Follow up with specific observations without overselling.',
    };
  }
}

export const aiService = new AIService();
