import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Contacts from "@/pages/contacts";
import NetworkPage from "@/pages/network";
import { ThemeProvider } from "@/contexts/theme-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/network" component={NetworkPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;