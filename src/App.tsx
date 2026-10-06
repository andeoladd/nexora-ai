import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ContactSupportModal } from './components/support/ContactSupportModal';
import { AIAssistantWidget } from './components/assistant/AIAssistantWidget';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WebsiteAnalyzerPage } from './pages/WebsiteAnalyzerPage';
import { FindLeadsPage } from './pages/FindLeadsPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadProfilePage } from './pages/LeadProfilePage';
import { LeadListsPage } from './pages/LeadListsPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BillingPage } from './pages/BillingPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { dbService } from './services/db';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeContextId, setActiveContextId] = useState<string | undefined>(undefined);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState<boolean>(false);

  // Check onboarding status whenever user changes
  useEffect(() => {
    async function checkOnboardingStatus() {
      if (user) {
        setCheckingOnboarding(true);
        try {
          const biz = await dbService.getBusiness(user.id);
          const services = await dbService.getServices(user.id);
          if (!biz || services.length === 0) {
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(false);
          }
        } catch (err) {
          console.error('Error checking onboarding:', err);
        } finally {
          setCheckingOnboarding(false);
        }
      } else {
        setNeedsOnboarding(false);
      }
    }
    checkOnboardingStatus();
  }, [user]);

  // Handle navigation
  const navigateTo = (view: string, contextId?: string) => {
    setCurrentView(view);
    setActiveContextId(contextId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Initializing Nexora Workspace...</p>
      </div>
    );
  }

  // 1. Unauthenticated Users
  if (!user) {
    if (currentView === 'signin') {
      return (
        <>
          <AuthPage
            initialMode="signin"
            onSuccess={() => setCurrentView('dashboard')}
          />
          <ContactSupportModal
            isOpen={supportModalOpen}
            onClose={() => setSupportModalOpen(false)}
          />
        </>
      );
    }
    if (currentView === 'signup') {
      return (
        <>
          <AuthPage
            initialMode="signup"
            onSuccess={() => setCurrentView('dashboard')}
          />
          <ContactSupportModal
            isOpen={supportModalOpen}
            onClose={() => setSupportModalOpen(false)}
          />
        </>
      );
    }

    return (
      <>
        <LandingPage
          onGetStarted={() => setCurrentView('signup')}
          onSignIn={() => setCurrentView('signin')}
          onOpenSupport={() => setSupportModalOpen(true)}
        />
        <ContactSupportModal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
        />
      </>
    );
  }

  // 2. Onboarding Flow
  if (needsOnboarding) {
    return (
      <>
        <OnboardingPage
          onComplete={() => {
            setNeedsOnboarding(false);
            setCurrentView('dashboard');
          }}
        />
        <ContactSupportModal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
        />
      </>
    );
  }

  // 3. Authenticated Workspace
  const renderWorkspaceView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case 'website-analyzer':
        return <WebsiteAnalyzerPage onNavigate={navigateTo} />;
      case 'find-leads':
        return <FindLeadsPage onNavigate={navigateTo} />;
      case 'leads':
        return <LeadsPage onNavigate={navigateTo} />;
      case 'lead-profile':
        return <LeadProfilePage leadId={activeContextId || ''} onNavigate={navigateTo} />;
      case 'lead-lists':
        return <LeadListsPage onNavigate={navigateTo} />;
      case 'conversations':
        return <ConversationsPage initialConversationId={activeContextId} onNavigate={navigateTo} />;
      case 'campaigns':
        return <CampaignsPage onNavigate={navigateTo} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'billing':
        return <BillingPage />;
      case 'settings':
        return <SettingsPage onOpenSupport={() => setSupportModalOpen(true)} />;
      case 'help':
        return <HelpCenterPage onOpenSupport={() => setSupportModalOpen(true)} />;
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <>
      <AppLayout
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenSupport={() => setSupportModalOpen(true)}
      >
        {renderWorkspaceView()}
      </AppLayout>

      <AIAssistantWidget onNavigate={navigateTo} />

      <ContactSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
