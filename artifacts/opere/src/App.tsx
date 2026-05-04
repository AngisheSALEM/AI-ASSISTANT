import { Switch, Route, Router as WouterRouter } from "wouter";
import { ThemeProvider } from "next-themes";
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

function Router() {
  return (
    <>
      <DeepSpaceBg />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/copilot" component={CopilotPage} />
        <Route path="/:orgId/agents">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <AgentsPage orgId={params.orgId} />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId/knowledge">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <KnowledgePage />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId/analytics">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <AnalyticsPage />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId/marketplace">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <MarketplacePage orgId={params.orgId} />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId/settings">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <SettingsPage />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId/integrations">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <IntegrationsPage />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId/billing">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <BillingPage orgId={params.orgId} />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId/thinking">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <ThinkingPage />
            </DashboardLayout>
          )}
        </Route>
        <Route path="/:orgId">
          {(params) => (
            <DashboardLayout orgId={params.orgId}>
              <DashboardPage orgId={params.orgId} />
            </DashboardLayout>
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
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </ThemeProvider>
  );
}

export default App;
