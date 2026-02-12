import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/storage";

import Onboarding from "./pages/Onboarding";
import Setup from "./pages/Setup";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Learn from "./pages/Learn";
import Shadowing from "./pages/Shadowing";
import Recall from "./pages/Recall";
import Srs from "./pages/Srs";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRouter() {
  const settings = getSettings();

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  const getDefaultRoute = () => {
    if (!settings.onboardingComplete) return "/onboarding";
    if (!settings.setupComplete) return "/setup";
    return "/home";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/library" element={<Library />} />
      <Route path="/learn/:clipId" element={<Learn />} />
      <Route path="/shadowing/:clipId" element={<Shadowing />} />
      <Route path="/recall/:clipId" element={<Recall />} />
      <Route path="/srs" element={<Srs />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
