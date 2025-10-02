import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";

// Simple Components
import SimpleLanding from "./components/SimpleLanding";
import SimpleDashboard from "./components/SimpleDashboard";
import SimpleDocuments from "./components/SimpleDocuments";
import SimpleMessages from "./components/SimpleMessages";
import SimpleInvoices from "./components/SimpleInvoices";
import InviteClients from "./components/InviteClients";
import EmailIntegration from "./components/EmailIntegration";
import PaymentIntegration from "./components/PaymentIntegration";
import PricingPage from "./components/PricingPage";
import AboutUsPage from "./components/AboutUsPage";

// Enhanced Components
import ClientManagement from "./components/ClientManagement";
import EmployeeManagement from "./components/EmployeeManagement";
import EnhancedPricingPage from "./components/EnhancedPricingPage";
import EnhancedInvoices from "./components/EnhancedInvoices";
import PlatformSubscription from "./components/PlatformSubscription";
import ClientServicesManagement from "./components/ClientServicesManagement";
import ComplianceTracker from "./components/ComplianceTracker";
import ClientComplianceCalendar from "./components/ClientComplianceCalendar";
import BookkeepingManagement from "./components/BookkeepingManagement";

// Auth Components
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SimpleLanding />} />
            <Route path="/pricing" element={<EnhancedPricingPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <SimpleDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <SimpleDocuments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <SimpleMessages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute>
                  <EnhancedInvoices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <ClientManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employees" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <EmployeeManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invite-clients" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <InviteClients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/email-integration" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <EmailIntegration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payments" 
              element={
                <ProtectedRoute>
                  <PaymentIntegration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <PlatformSubscription />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client-services" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <ClientServicesManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/compliance" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <ComplianceTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/compliance-calendar" 
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientComplianceCalendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookkeeping" 
              element={
                <ProtectedRoute roles={['tax_professional', 'admin']}>
                  <BookkeepingManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;