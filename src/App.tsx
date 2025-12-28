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

const queryClient = new QueryClient();

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/signup"
        element={session ? <Navigate to="/" replace /> : <AuthPage defaultMode="signup" />}
      />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected route */}
      <Route
        path="/*"
        element={
          session ? (
            <Layout>
              <MaterialRequestList />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
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
