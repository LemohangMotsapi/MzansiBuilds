import React, { useState } from "react";
import { motion } from "framer-motion";
import { Hand, ExternalLink, Trash2, Edit3, PlusCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { toast } from "sonner";
import MilestoneModal from "./MilestoneModal";

const statusConfig = {
  "Researching": { dot: "bg-yellow-400", label: "Researching", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  "In Progress": { dot: "bg-primary", label: "In Progress", bg: "bg-primary/10", text: "text-primary" },
  "Shipped": { dot: "bg-blue-400", label: "Shipped", bg: "bg-blue-500/10", text: "text-blue-400" },
};

const ProjectCard = ({ project, onRefresh, onEdit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  
  const config = statusConfig[project.status] || statusConfig["Researching"];
  const isOwner = user && user.id === project.user_id;

  const techTags = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // Updated handler to trigger collaboration and auto-comment
  const handleRaiseHand = async (e) => {
    e.stopPropagation(); 
    if (!user) {
      toast.error("Sign in to collaborate");
      return;
    }
    try {
      // Triggers the backend logic (DB log + System Comment)
      await api.post(`/projects/${project.id}/collaborate`);
      toast.success("HAND_RAISED: Owner notified via discussion thread! ✋");
      
      // Refresh to update the hand count badge instantly
      if (onRefresh) onRefresh();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Could not raise hand";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    try {
      await api.delete(`/projects/${project.id}`);
      toast.success("Project deleted successfully");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate(`/project/${project.id}`)}
        className="rounded-lg bg-card border border-border hover:neon-border transition-all duration-300 overflow-hidden cursor-pointer"
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate text-base">
                {project.title}
              </h3>
              {project.users?.username && (
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  @{project.users.username}
                </p>
              )}
            </div>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono ${config.bg} ${config.text} shrink-0`}>
              <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
              {config.label}
            </span>
          </div>

          {/* HAND COUNT BADGE - Displays social proof of collaboration */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-primary/70 mb-3 uppercase tracking-tighter">
            <Hand className="w-3 h-3" />
            <span>{project.project_collaborations?.[0]?.count || 0} HANDS_RAISED</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
            {project.description}
          </p>

          {/* Tech Stack */}
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

          {/* SUPPORT REQUIRED SECTION */}
          {project.support_required && project.support_required !== "false" && (
            <div className="mb-4 p-3 rounded-md bg-primary/5 border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Support_Required</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-2">
                "{project.support_required}"
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {project.created_at && (
              <span className="text-xs font-mono text-muted-foreground">
                {new Date(project.created_at).toLocaleDateString("en-ZA")}
              </span>
            )}

            <div className="flex items-center gap-2">
              {isOwner ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsMilestoneOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                    title="Log Milestone"
                  >
                    <PlusCircle className="w-3 h-3" />
                    LOG
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(); 
                    }} 
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {user && project.status !== "Shipped" && (
                    <button
                      onClick={handleRaiseHand}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors neon-border relative z-10"
                    >
                      <Hand className="w-3.5 h-3.5" />
                      Raise Hand
                    </button>
                  )}
                  {project.status === "Shipped" && (
                    <span className="flex items-center gap-1 text-xs text-blue-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Shipped
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <MilestoneModal 
        isOpen={isMilestoneOpen} 
        onClose={() => setIsMilestoneOpen(false)} 
        projectId={project.id}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ProjectCard;