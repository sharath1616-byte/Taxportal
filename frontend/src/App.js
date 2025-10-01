import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import IndustryShowcase from "./components/IndustryShowcase";
import ClientPortalSection from "./components/ClientPortalSection";
import AIBackofficeSection from "./components/AIBackofficeSection";
import IntegrationsSection from "./components/IntegrationsSection";
import FeaturesGrid from "./components/FeaturesGrid";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

// Auth Components
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./components/Dashboard";

// Page Components
import Customers from "./components/pages/Customers";
import Pricing from "./components/pages/Pricing";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <IndustryShowcase />
      <ClientPortalSection />
      <AIBackofficeSection />
      <IntegrationsSection />
      <FeaturesGrid />
      <CTASection />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;