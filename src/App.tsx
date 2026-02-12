import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { getSettings } from "@/lib/storage";

import Setup from "./pages/Setup";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Memories from "./pages/Memories";
import Resources from "./pages/Resources";
import Learn from "./pages/Learn";
import Shadowing from "./pages/Shadowing";
import Srs from "./pages/Srs";
import Settings from "./pages/Settings";
import SettingsMemo from "./pages/SettingsMemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRouter() {
  const settings = getSettings();

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  const getDefaultRoute = () => {
    return settings.setupComplete ? "/home" : "/setup";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/library" element={<Library />} />
      <Route path="/memories" element={<Memories />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/learn/:clipId" element={<Learn />} />
      <Route path="/shadowing/:clipId" element={<Shadowing />} />
      <Route path="/srs" element={<Srs />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/memo" element={<SettingsMemo />} />
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
