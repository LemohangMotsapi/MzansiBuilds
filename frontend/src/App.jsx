import React, { useState, useEffect } from 'react'; // Import React's "Smart Tools"
import axios from 'axios'; // Import the "Messenger" to talk to the backend
import Navbar from './components/Navbar';

function App() {
  //Define 'projects' as a smart variable. It starts as an empty list [].
  const [projects, setProjects] = useState([]);

  // This function calls your backend
  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Run the fetch function as soon as the page loads
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <header className="py-24 px-6 text-center">
        <h1 className="text-8xl font-black tracking-tighter leading-[0.8] mb-4">
          SHIP <br /> 
          <span className="text-mzansi-green italic uppercase">Work.</span>
        </h1>
      </header>

      <main className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/*Map over our projects list and create a card for each one */}
          {projects.map((project) => (
            <div key={project.id} className="project-card group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold tracking-widest text-mzansi-green border border-mzansi-green/30 px-2 py-0.5 rounded uppercase">
                  {project.status || 'In Progress'}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-mzansi-green transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                {project.description}
              </p>
              <div className="text-[10px] font-mono text-gray-500 uppercase">
                {project.tech_stack}
              </div>
            </div>
          ))}

        </div>
      </main>
    </div>
  );
}

export default App;