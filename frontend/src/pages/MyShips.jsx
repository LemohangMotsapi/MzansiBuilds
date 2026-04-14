import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Rocket, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import EditProjectModal from "../components/EditProjectModal"; // NEW IMPORT
import { Navigate } from "react-router-dom";

const MyShips = () => {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  const fetchMyProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects/my-ships");
      setProjects(res.data.projects || res.data || []);
    } catch {
      console.error("Failed to fetch my projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchMyProjects();
  }, [user, fetchMyProjects]);

 
  const handleEditInitiated = (project) => {
    setProjectToEdit(project);
    setEditModalOpen(true);
  };

  if (!authLoading && !user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              My Ships
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Your build-in public journey</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ship
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-sm mb-4">No ships yet. Start building!</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ship Your First Project
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* ADDED onEdit PROP HERE */}
                <ProjectCard 
                  project={project} 
                  onRefresh={fetchMyProjects} 
                  onEdit={() => handleEditInitiated(project)} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* NEW EDIT MODAL */}
      <EditProjectModal 
        isOpen={editModalOpen}
        project={projectToEdit}
        onClose={() => setEditModalOpen(false)}
        onUpdate={fetchMyProjects}
      />

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshProjects={fetchMyProjects}
      />
    </div>
  );
};

export default MyShips;