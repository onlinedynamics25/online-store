import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import Index from "./pages/Index.js";
import NotFound from "./pages/NotFound.js";
import { AuthProvider } from "./context/AuthContext.js";
import AuthModal from "./components/auth/AuthModal.js";
import "./App.css";
import { ShopProvider } from "./context/ShopContext.js";
import Dashboard from "./pages/Dashboard.js";
import Blog from "./pages/Blog.js";
import Contact from "./pages/Contact.js";
import About from "./pages/About.js";
import Services from "./pages/Services.js";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AuthModal />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
