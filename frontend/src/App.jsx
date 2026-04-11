import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "sonner"; // Using standard sonner import
import { AuthProvider } from "./context/AuthContext"; // Fixed path

// Fixed relative paths for your components and pages
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import MyShips from "./pages/MyShips";
import CelebrationWall from "./pages/CelebrationWall";
import ProjectDetail from "./pages/ProjectDetail";

// Setup React Query for data fetching
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        {/* The deep black background we established in the design system */}
        <div className="min-h-screen bg-[#0A0A0A] text-white">
          <Sonner theme="dark" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/my-ships" element={<MyShips />} />
            <Route path="/celebration" element={<CelebrationWall />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            {/* Added a fallback route just in case */}
            <Route path="*" element={<div className="p-24 text-center">404 - Log Not Found</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  </QueryClientProvider>
);

export default App;