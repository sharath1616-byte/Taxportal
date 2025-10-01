import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const Home = () => {
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;