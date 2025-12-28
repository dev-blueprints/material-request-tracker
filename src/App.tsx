import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout/Layout";

import { useAuth } from "./hooks/useAuth";
import { AuthPage } from "./pages/Auth";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MaterialRequestList } from "@/pages/MaterialRequestList";
import { ForgotPasswordPage } from "@/pages/ForgotPassword";
import { ResetPasswordPage } from "@/pages/ResetPassword";
import { OnboardingPage } from "./pages/Onboarding";

const queryClient = new QueryClient();

function ProtectedApp({
  session,
  refreshToggle,
  setRefreshToggle,
}: {
  session: any;
  refreshToggle: number;
  setRefreshToggle: React.Dispatch<React.SetStateAction<number>>;
}) {
  const companyId = session.user.user_metadata?.company_id || session.user.app_metadata?.company_id;
  console.log("companyId:", companyId);

  if (!companyId) {
    return <OnboardingPage onComplete={() => setRefreshToggle((v) => v + 1)} />;
  }

  return (
    <Layout>
      <MaterialRequestList key={refreshToggle} />
    </Layout>
  );
}

function AppContent() {
  const { session, loading } = useAuth();
  const [refreshToggle, setRefreshToggle] = useState(0);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      {/* ---------- Public routes ---------- */}
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <AuthPage defaultMode="login" />}
      />

      <Route
        path="/signup"
        element={session ? <Navigate to="/" replace /> : <AuthPage defaultMode="signup" />}
      />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ---------- Protected routes ---------- */}
      <Route
        path="/*"
        element={
          !session ? (
            <Navigate to="/login" replace />
          ) : (
            <ProtectedApp
              session={session}
              refreshToggle={refreshToggle}
              setRefreshToggle={setRefreshToggle}
            />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
