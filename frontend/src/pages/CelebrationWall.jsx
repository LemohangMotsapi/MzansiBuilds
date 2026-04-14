import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, ExternalLink } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

const CelebrationWall = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Define fetch as a stable function so we can reuse it after clapping
  const fetchShipped = useCallback(async () => {
    try {
      const res = await api.get("/projects/celebrations?status=Shipped");
      setProjects(res.data.projects || res.data || []);
    } catch {
      console.error("Failed to fetch shipped projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipped();
  }, [fetchShipped]);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 py-16 md:py-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
              Hall of <span className="text-yellow-400">Fame</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Celebrating shipped projects from South Africa's dev community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No shipped projects yet. Keep building!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => {
              const techTags = project.tech_stack
                ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
                : [];

              // 2. Logic for Clapping
              const handleClap = async (e) => {
                e.stopPropagation();
                try {
                  await api.post(`/projects/${project.id}/clap`);
                  toast.success("👏 Achievement acknowledged");
                  fetchShipped(); // Refresh data to show new count
                } catch (err) {
                  toast.error("Sign in to cheer them on!");
                }
              };

              const clapCount = project.clap_count?.[0]?.count || 0;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-xl bg-card border border-border hover:border-yellow-500/30 transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-1 bg-gradient-to-r from-yellow-500 via-primary to-blue-500" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{project.title}</h3>
                        {project.username && (
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">
                            @{project.username}
                          </p>
                        )}
                      </div>
                      <Trophy className="w-5 h-5 text-yellow-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {techTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {techTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-xs font-mono bg-secondary text-muted-foreground border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        {/* 👏 CLAP BUTTON */}
                        <motion.button
                          whileTap={{ scale: 1.4 }}
                          onClick={handleClap}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
                        >
                          <span className="text-sm">👏</span>
                          <span className="text-xs font-bold">{clapCount}</span>
                        </motion.button>

                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                           {new Date(project.created_at).toLocaleDateString("en-ZA")}
                        </span>
                      </div>

                      {/* 🔗 VIEW LIVE LINK */}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                          VIEW_LIVE
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CelebrationWall;