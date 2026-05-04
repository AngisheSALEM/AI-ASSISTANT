import { useEffect, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import OnboardingPage from "@/pages/onboarding";
import CopilotPage from "@/pages/copilot";
import DashboardLayout from "@/pages/dashboard/layout";
import DashboardPage from "@/pages/dashboard/overview";
import AgentsPage from "@/pages/dashboard/agents";
import KnowledgePage from "@/pages/dashboard/knowledge";
import AnalyticsPage from "@/pages/dashboard/analytics";
import MarketplacePage from "@/pages/dashboard/marketplace";
import SettingsPage from "@/pages/dashboard/settings";
import IntegrationsPage from "@/pages/dashboard/integrations";
import BillingPage from "@/pages/dashboard/billing";
import ThinkingPage from "@/pages/dashboard/thinking";

function DeepSpaceBg() {
  return (
    <div className="deep-space-bg dark:block hidden">
      <div className="noise-overlay" />
      <div className="glow-circle glow-violet" />
      <div className="glow-circle glow-blue" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

function Router() {
  return (
    <>
      <DeepSpaceBg />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/onboarding">
          <ProtectedRoute><OnboardingPage /></ProtectedRoute>
        </Route>
        <Route path="/copilot">
          <ProtectedRoute><CopilotPage /></ProtectedRoute>
        </Route>
        <Route path="/:orgId/agents">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <AgentsPage orgId={params.orgId} />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId/knowledge">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <KnowledgePage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId/analytics">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <AnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId/marketplace">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <MarketplacePage orgId={params.orgId} />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId/settings">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId/integrations">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <IntegrationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId/billing">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <BillingPage orgId={params.orgId} />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId/thinking">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <ThinkingPage />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/:orgId">
          {(params) => (
            <ProtectedRoute>
              <DashboardLayout orgId={params.orgId}>
                <DashboardPage orgId={params.orgId} />
              </DashboardLayout>
            </ProtectedRoute>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
