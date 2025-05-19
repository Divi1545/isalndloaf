import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SimpleApp />
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
