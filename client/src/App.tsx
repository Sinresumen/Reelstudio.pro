import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfigProvider } from "@/contexts/ConfigContext";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Client from "@/pages/client";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/client/:username" component={Client} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
