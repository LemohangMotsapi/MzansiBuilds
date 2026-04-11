import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Milestone, Share2 } from "lucide-react";
import api from "../api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext"; // Added for discussion permissions
import DiscussionSection from "../components/DiscussionSection"; // Added implementation

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Access current logged-in user
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch main project first
      const projRes = await api.get(`/projects/${id}`);
      const baseData = projRes.data.project;

      // 2. Fetch extras using allSettled to prevent empty tables from crashing the UI
      const [mRes, dRes] = await Promise.allSettled([
        api.get(`/projects/${id}/milestones`),
        api.get(`/projects/${id}/discussions`),
      ]);

      setProject({
        ...baseData,
        milestones: mRes.status === "fulfilled" ? mRes.value.data.milestones : [],
        discussions: dRes.status === "fulfilled" ? dRes.value.data.discussions : [],
      });
    } catch (error) {
      toast.error("Project not found in logs");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  if (loading) return <div className="p-20 text-center font-mono animate-pulse">ACCESSING_DATA...</div>;
  if (!project) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-mono text-sm">BACK_TO_FEED</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Project Header */}
          <section>
            <h1 className="text-4xl font-bold tracking-tighter mb-4">{project.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{project.description}</p>
          </section>

          {/* Engineering Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
              <Milestone className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Engineering Timeline</h2>
            </div>
            
            <div className="space-y-6">
              {project.milestones?.length > 0 ? (
                project.milestones.map((ms) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={ms.id} 
                    className="p-4 rounded-lg border border-border bg-card/30"
                  >
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-primary">
                      <span>{ms.status}</span>
                      <span>{new Date(ms.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold">{ms.title}</h4>
                    <p className="text-sm text-muted-foreground">{ms.description}</p>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm font-mono">
                  NO_MILESTONES_LOGGED_YET
                </div>
              )}
            </div>
          </section>

          {/* Discussion System - LIVE IMPLEMENTATION */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Discussion & Q&A</h2>
            </div>
            
            <DiscussionSection 
              projectId={id} 
              discussions={project.discussions} 
              onRefresh={fetchProjectDetails}
              user={user}
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 p-6 rounded-xl bg-card border border-border space-y-6">
            <div>
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.split(",").map(tag => (
                  <span key={tag} className="px-2 py-1 bg-secondary text-[10px] font-mono rounded border border-border">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="pt-6 border-t border-border space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">STATUS</span>
                <span className="text-primary font-bold">{project.status}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">LAUNCHED</span>
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> SHARE_PROJECT
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetail;