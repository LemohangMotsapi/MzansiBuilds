import React from "react";
import { motion } from "framer-motion";
import { Hand, ExternalLink, Trash2, Edit3, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { toast } from "sonner";

const statusConfig = {
  "Researching": { dot: "bg-yellow-400", label: "Researching", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  "In Progress": { dot: "bg-primary", label: "In Progress", bg: "bg-primary/10", text: "text-primary" },
  "Shipped": { dot: "bg-blue-400", label: "Shipped", bg: "bg-blue-500/10", text: "text-blue-400" },
};

const ProjectCard = ({ project, onRefresh }) => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize navigation
  const config = statusConfig[project.status] || statusConfig["Researching"];
  
  const isOwner = user && user.id === project.user_id;

  const techTags = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const handleRaiseHand = async (e) => {
    e.stopPropagation(); 
    if (!user) {
      toast.error("Sign in to collaborate");
      return;
    }
    try {
      await api.post(`/projects/${project.id}/collaborate`);
      toast.success("Hand raised! The developer will be notified.");
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Could not raise hand. Try again.");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Stop navigation from firing
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/project/${project.id}`)} // Navigate on click
      className="rounded-lg bg-card border border-border hover:neon-border transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-base">
              {project.title}
            </h3>
            {project.username && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                @{project.username}
              </p>
            )}
          </div>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono ${config.bg} ${config.text} shrink-0`}>
            <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
            {config.label}
          </span>
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
                    /* We will trigger Milestone Modal here later */
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                  title="Log Milestone"
                >
                  <PlusCircle className="w-3 h-3" />
                  LOG
                </button>
                <button
                  onClick={(e) => e.stopPropagation()} // Stop navigation
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors neon-border"
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
  );
};

export default ProjectCard;