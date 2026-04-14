import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowDown, Plus, RefreshCw } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";

const Home = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || res.data || []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = filter === "All"
    ? projects
    : projects.filter((p) => p.status === filter);

  const filters = ["All", "Researching", "In Progress", "Shipped"];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(166_100%_50%/0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="status-dot-in-progress" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">
                
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none mb-4">
              SHIP<br />
              <span className="neon-text">WORK</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-8">
              Build in public. Stay accountable. Collaborate with South Africa's developer community.
            </p>
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ship New Work
                </button>
              )}
              <a
                href="#feed"
                className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
                View Feed
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feed */}
      <section id="feed" className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            {/* Removed Terminal Icon from here */}
            <h2 className="text-xl font-bold text-foreground">Feed</h2>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-secondary rounded-md p-0.5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                    filter === f
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={fetchProjects}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-sm">No projects yet. Be the first to ship!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard project={project} onRefresh={fetchProjects} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshProjects={fetchProjects}
      />
    </div>
  );
};

export default Home;