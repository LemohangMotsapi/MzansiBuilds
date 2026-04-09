import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import API from './api';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';

function App() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get('/projects').then(res => setProjects(res.data.projects));
  }, []);

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <header className="py-24 px-6 text-center">
                <h1 className="text-8xl font-black tracking-tighter leading-[0.8] mb-4">
                  SHIP <br /> 
                  <span className="text-mzansi-green italic uppercase">Work.</span>
                </h1>
              </header>
              <main className="container mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="project-card group">
                      {/* 1. THE STATUS BADGE */}
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-bold tracking-widest text-mzansi-green border border-mzansi-green/30 px-2 py-0.5 rounded uppercase">
                          {project.status || 'In Progress'}
                        </span>
                      </div>

                      {/* 2. THE CONTENT */}
                      <h3 className="text-xl font-bold mb-2 group-hover:text-mzansi-green transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                        {project.description}
                      </p>

                      {/* 3. THE TECH TAGS */}
                      <div className="flex gap-2 font-mono text-[10px] text-gray-500 uppercase">
                        {project.tech_stack ? (
                          <span>#{project.tech_stack}</span>
                        ) : (
                          <span>#ShipIt</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </main>
            </>
          } />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;